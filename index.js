// Setup basic express server
var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var morgan = require('morgan')
var app = express();
var server = require('http').createServer(app);
var io = require('./src/io.js')(server);
var chat = require('./src/router.js');
var port = process.env.PORT || 3000;

//app.use(express.favicon());
app.set('view engine', 'ejs');
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser('secret'));
app.use(session({ cookie: { maxAge: 60000 } }));
//app.use(express.methodOverride());
app.use(express.static(__dirname + '/public'));
app.use('/chat', chat);

app.get('/', function (req, res, next) {     
    res.render('pages/index');
})

server.listen(port, function () {
    console.log('Server listening at port %d', port);
})
