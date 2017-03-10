var socket;
$(function () {

  $('.menu .item').tab({});

  socket = io();
  socket.on('connect', function(msg){
    // $('#console').append('<p>Controller: Connected to Controller Service</p>');
    logConsole('Controller', '> Connected to Controller Service');
  });
  // socket.on('arm_connected', function(msg){
  //   // $('#console').append('<p>Controller: ' + msg + '</p>');
  //   logConsole('Controller', '> ' + msg);
  // });
  socket.on('robot_connected', function(data){
    // $('#console').append('<p>Controller: ' + msg + '</p>');
    logConsole('Controller', '> Robot Arm Connected (' + data + ')');
  });
  
});

function sendCommand(command) {
  // $('#console').append('<p>Controller: Sending Command: ' + command + '</p>');
  logConsole('Controller', '< <code>' + command + '</code>');
  socket.emit('send_command', command);
}

function callPathService(to, from) {

  var pathTime = new Date().getTime();
  $.ajax({
     url: "https://api.maninthepicastle.iwa.ecovate.com/path",
     data: {
      from: "A2",
      to: "A3"
     }
  }).done(function(data) {
    var totalTime = new Date().getTime()-pathTime;
    // $('#console').append('<p>' + JSON.stringify(data) + '<br />[ took: ' + totalTime + 'ms ]</p>');
    logConsole('Path: ', '<code class="json">' + JSON.stringify(data) + '</code><br />[ took: ' + totalTime + 'ms ]');
  });
}

function logConsole(service, message, format) {

  var html = '<div class="Grid Grid--gutters u-textCenter"><div class="Grid-cell u-1of2"><div class="Demo">'+service+'</div></div><div class="Grid-cell"><div class="Demo">'+message+'</div></div></div>';
  $('#console').append(html);
}