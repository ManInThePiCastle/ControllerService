var path = require('path');
var express = require('express');
var app = express();

// var exphbs = require('express-handlebars');
var jade = require('jade');
var logger = require('morgan');
// var cookieParser = require('cookie-parser');
// var bodyParser = require('body-parser');


var server = require('http').Server(app);
var io = require('socket.io')(server);
var port = 80

var routes = require('./routes/index');
var users = require('./routes/users');




// app.engine('.hbs', exphbs({  
//   defaultLayout: 'main',
//   extname: '.hbs',
//   layoutsDir: path.join(__dirname, 'views/layouts')
// }))
app.set('views', __dirname + '/views')
app.set('view engine', 'jade')
// app.use(express.logger('dev'))

// app.get('/', (request, response) => {  
//   response.render('home', {
//     name: 'John'
//   })
// })
app.use(function(req, res, next){
  res.io = io;
  next();
});
app.use(logger('dev'));
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.get('/', function (req, res) {
  res.render('index',
  { title : 'Home' }
  )
})
// app.use('/', routes);
app.use('/semantic', express.static('semantic'))
// app.use('/public', express.static('public'))
// app.use(express.static(__dirname + '/public'));
// app.use('/users', users);

io.on('connection', function(socket){
  console.log('socket: a user connected');
  
  socket.on('arm_connected', function (data, data2) {
    console.log('socket: a robot arm connected ' + data);
    io.emit('robot_connected', data);
  });
  socket.on('send_command', function (command) {
    console.log('socket: command recieved: ' + command);
    io.emit('command', command);
    console.log(io.sockets.clients());
  });
  socket.on('arm_disconnected', function (command) {
    console.log('socket: arm disconnected');
    io.emit('robot_disconnected');
  });

  
});

io.use(function(socket, next) {
  var handshakeData = socket.request;
  console.log("middleware:", handshakeData._query['name']);
  next();
});



server.listen(port, (err) => {  
  if (err) {
    return console.log('something bad happened', err)
  }

  console.log(`server is listening on ${port}`)
})