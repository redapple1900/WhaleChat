var client = require('./redis-client.js')(process.env.REDIS_URL);

module.exports = function (server) {

    var io = require('socket.io')(server);

    var numUsersMap = {};

    // TODO:: 1. Authentication
    
    io.on('connection', function (socket) {
        
        var addedUser = false;
        // when the client emits 'new message', this listens and executes
        socket.on('new message', function (data) {
            // we tell the client to execute 'new message'
            var msg = {
                username : socket.username,
                message : data
            };
            socket.broadcast.to(socket.room).emit('new message', msg);
            client.lpush(socket.room, JSON.stringify(msg));
        });

        socket.on('set up', function (data) {
            if (data && data.roomname) {
                if (numUsersMap[data.roomname]) {
                    if (numUsersMap[data.roomname] >= 2) return;
                } else {
                    numUsersMap[data.roomname] = 0;
                }
            } else return;
            
            socket.room = data.roomname;
            socket.username = data.username;
            numUsersMap[socket.room] += 1;
            addedUser = true;

            socket.join(socket.room);
            socket.emit('login', {
                numUsers: numUsersMap[socket.room]
            });

            // echo globally (all clients) that a person has connected
            socket.broadcast.to(socket.room).emit('user joined', {
                username: socket.username,
                numUsers: numUsersMap[socket.room]
            });
            // Send the most recent messages to recently joined users.
            client.exists(socket.room, function (err, reply) {
                if (err) {
                    console.log("No room:" + err);
                    return;
                }
               
                client.lrange(socket.room, 0, 4, function (err, msg) {
                    if (err) {
                        console.log("Redis Read Error:" + err);
                        return;
                    }

                    for (var i = 4; i >= 0; i--) {
                        if (msg[i]) {
                            socket.emit('new message', JSON.parse(msg[i]));
                        } 
                    }
                });
            });
        })
        
        // when the client emits 'typing', we broadcast it to others
        socket.on('typing', function () {
            socket.broadcast.to(socket.room).emit('typing', {
                username : socket.username
            });
        });
        
        // when the client emits 'stop typing', we broadcast it to others
        socket.on('stop typing', function () {
            socket.broadcast.to(socket.room).emit('stop typing', {
                username : socket.username
            });
        });
        
        // when the user disconnects.. perform this
        socket.on('disconnect', function () {
            if (addedUser) {
                numUsersMap[socket.room]--;
                if (numUsersMap[socket.room] === 0) {
                    client.del(socket.room, function (err, reply) {
                    });
                }
                // echo globally that this client has left
                socket.broadcast.to(socket.room).emit('user left', {
                    username : socket.username,
                    numUsers : numUsersMap[socket.room]
                });
                socket.leave(socket.room);
            }
        });
    });
}

