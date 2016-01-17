// Setup basic express server
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;
var redis_url = process.env.REDIS_URL;
var client;

if (redis_url) {
    var rtg = require('url').parse(redis_url);
    client = require('redis').createClient(rtg.port, rtg.hostname);
    client.auth(rtg.auth.split(':')[1]);
} else {
    client = require('redis').createClient();
}

server.listen(port, function () {
	console.log('Server listening at port %d', port);
})

// Routing
app.use(express.favicon());
app.use(express.logger('dev'));
//app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(__dirname + '/public'));

// Chatroom

var numUsers = 0;

io.on('connection', function(socket) {

	var addedUser = false;

	// when the client emits 'new message', this listens and executes
	socket.on('new message', function(data) {
		// we tell the client to execute 'new message'
		var msg = {
			username : socket.username,
			message : data
		};

		socket.broadcast.to(socket.room).emit('new message', msg);
		client.lpush(socket.room, JSON.stringify(msg));
	});

	// when the client emits 'add user', this listens and executes
	socket.on('add user', function(username) {
		if (addedUser)
			return;

		// we store the username in the socket session for this client
		socket.username = username;
		console.log(username);
		++numUsers;
		addedUser = true;
	});

	socket.on('set room', function(roomname) {
		socket.room = roomname;
		console.log(roomname)
		socket.join(socket.room);
		socket.emit('login', {
			numUsers : numUsers
		});

		// echo globally (all clients) that a person has connected
		socket.broadcast.to(socket.room).emit('user joined', {
			username : socket.username,
			numUsers : numUsers
		});
		client.exists(socket.room, function(err, reply) {
			if (reply === 1) { //There is key
				client.lrange(socket.room, 0, 0, function(err, msg) {
					if (err) {
						console.log("Redis Read Error:" + err);
					} else {
						socket.emit('new message', JSON.parse(msg[0]));
					}
				});
			}
		});
	})

	// when the client emits 'typing', we broadcast it to others
	socket.on('typing', function() {
		socket.broadcast.to(socket.room).emit('typing', {
			username : socket.username
		});
	});

	// when the client emits 'stop typing', we broadcast it to others
	socket.on('stop typing', function() {
		socket.broadcast.to(socket.room).emit('stop typing', {
			username : socket.username
		});
	});

	// when the user disconnects.. perform this
	socket.on('disconnect', function() {
		if (addedUser) {
			--numUsers;
			if (numUsers === 0) {
				client.del(socket.room, function(err, reply) {
				});
			}
			// echo globally that this client has left
			socket.broadcast.to(socket.room).emit('user left', {
				username : socket.username,
				numUsers : numUsers
			});
			socket.leave(socket.room);
		}
	});
});