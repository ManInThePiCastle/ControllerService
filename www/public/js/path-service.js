var socket;
$(function () {

  $('.menu .item').tab({});

  socket = io();
  
  socket.on('connect', function(msg){
    logConsole('Controller', '> Connected to Controller Service');
  });

  socket.on('disconnect', function(msg){
    logConsole('Controller', '> Disconnected from Controller Service');
  });  

  socket.on('arm_connected', function(data) {
    var ipregex = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/;
    var ip =data.match(ipregex);
    armOn(ip);
    logConsole('Controller', '> Robot Arm Connected (' + data + ')');
  });

  socket.on('arm_disconnected', function() {
    armOff();
    logConsole('Controller', '> Robot Arm Disconnected');
  });  

  socket.on('command', function(data){
    logConsole('Controller', '> <code class="green">' + data + '</code>');
  });
  
});

function armOn(ip) {
  $('#armIP').html(ip);
  $('.conn_status.disconnected').hide();
  $('.conn_status.connected').show();
}

function armOff() {
  $('.conn_status.connected').hide();
  $('.conn_status.disconnected').show();
}

function sendCommand(command) {
  // $('#console').append('<p>Controller: Sending Command: ' + command + '</p>');
  logConsole('Controller', '< <code>' + command + '</code>');
  socket.emit('send_command', command);
}

function callPathService(from, to) {

  logConsole('Path', 'Moving ' + from + ' -> ' + to);
  var pathTime = new Date().getTime();
  $.ajax({
     url: "https://api.maninthepicastle.iwa.ecovate.com/path",
     data: {
      from: from,
      to: to
     }
  }).done(function(data) {
    var totalTime = new Date().getTime()-pathTime;
    // $('#console').append('<p>' + JSON.stringify(data) + '<br />[ took: ' + totalTime + 'ms ]</p>');
    logConsole('Path', '<code class="json">' + JSON.stringify(data) + '</code><br />[ took: ' + totalTime + 'ms ]');

    // Tallest piece + board height
    var moveHeight = Number($('#config-move-height').val());
    var playingSurfaceLength = Number($('#config-square-size').val())*8;

    // Coordinates are returned as % of board playing surface
    logConsole('Path', 'Translating relative coordinates to physical coordinates (mm)');
    $.each(data.steps, function (key, value) {
      if(Array.isArray(value)) {
        var position = new THREE.Vector3(value[0], value[1], value[2]);
        // Multiply by the length of playing surface so we can get mm positioning
        // Z axis set to moveHeight
        position.multiply(new THREE.Vector3(playingSurfaceLength, playingSurfaceLength, moveHeight));
        // Offset x=0 to be center of board instad of position a1
        // Add y-offset (distance to board) 
        // and z-offset (height of board)
        position.add(new THREE.Vector3(-1*(playingSurfaceLength/2), Number($('#config-distance-to-playing-surface').val()), Number($('#config-board-height').val()) + 1));
        // Finally, offset the 
        moveToCoord(Math.round(position.x), Math.round(position.y), Math.round(position.z));
      } else {
        graspCommand(value);
      }
    })

    // moveToCoord(x, y, z)
  });
}

function articulate(point, direction, steps) {
  sendCommand("/manualcontrol/"+point+"/"+direction+"/"+steps);
}

function humanMove(from, to) {
  // TODO send to chess service
  logConsole('Chess', 'Human move: ' + from + ' -> ' + to);
  chessCallback();
}

function chessCallback() {
  data = {}
  data.from = "a1";
  data.to = "h8";
  logConsole('Chess', 'Arm move (AI-mock): '+ data.from +' -> '+ data.to);
  callPathService(data.from, data.to)
}

function clearConsole() {
  $('#console').empty();
}

function logConsole(service, message, format) {

  var html = '<div class="Grid Grid--gutters u-textCenter"><div class="Grid-cell u-1of2"><div class="Demo">'+service+'</div></div><div class="Grid-cell"><div class="Demo">'+message+'</div></div></div>';
  $('#console').append(html);
  var objDiv = document.getElementById("console");
  objDiv.scrollTop = objDiv.scrollHeight;
}

function moveToCoord(x, y, z) {
  sendCommand("/move/"+x+"/"+y+"/"+z);
}

function graspCommand(command) {
  sendCommand("/grabber/"+command);
}