var path = require('path');
var express = require('express');
var app = express();

// var exphbs = require('express-handlebars');
var jade = require('jade');
var logger = require('morgan');
// var cookieParser = require('cookie-parser');
// var bodyParser = require('body-parser');


var server = require('http').Server(app);
var io = require('socket.io')(server, {'pingInterval': 2000, 'pingTimeout': 5000});

if(process.env.NODE_ENV == "development") {
  var port = 31415
} else {
  var port = 80
}

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

var armConnected = false;
io.on('connection', function(socket){
  
  if(socket.handshake.query.name == "arm") {

    console.log('robot arm connected ' + socket.handshake.query.ip);

    // Tell everyone the robot connected
    armConnected = socket.handshake.query.ip;
    io.emit('arm_connected', armConnected);

    
    
    socket.on('disconnect', function(data){
      
      // Tell everyone the robot disconnected
      io.emit('arm_disconnected');

      armConnected = false;
      console.log('robot arm disconnected');
    });
  } else {
    console.log('socket: a web user connected');

    // If robot arm connect, tell user
    if(armConnected) {
      socket.emit('arm_connected', armConnected);  
    }
    
    socket.on('disconnect', function(data){
      console.log('web user disconnected');
      // console.log(data);
      // var i = allClients.indexOf(socket);
      // console.log(allClients[i]);
      // delete allClients[i];
    });
  }
  
  // socket.on('arm_connected', function (data, data2) {

  // });

  // If the arm is connect, tell this new person;
  // socket.emit('arm_connected', armConnected);


  socket.on('send_command', function (command) {
    console.log('socket: command recieved: ' + command);
    io.emit('command', command);
  });



  
});




// t.on('disconnect', function(){
//     socket.broadcast.to(roomName).emit('user_leave', {user_name: "johnjoe123"});
// });

// io.use(function(socket, next) {
//   var handshakeData = socket.request;
//   console.log("middleware:", handshakeData._query['name']);
//   next();
// });



server.listen(port, (err) => {  
  if (err) {
    return console.log('something bad happened', err)
  }

  console.log(`server is listening on ${port}`)
})