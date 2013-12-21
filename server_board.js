var express = require('express');
var app = express();
//var server = require('http').createServer(app);
var fs = require('fs');
var privateKey = fs.readFileSync('fakekeys/privatekey.pem').toString(),
    certificate = fs.readFileSync('fakekeys/certificate.pem').toString();
var server = require('https').createServer({key: privateKey, cert: certificate}, app);
var socket = require('socket.io');
var io = socket.listen(server);
var peopleOnline = 0;
var https = require('https');
var http = require('http');

var  uuid, ws;

ws = require('websocket.io');
uuid = require('node-uuid');


Array.prototype.remove = function(item){
  for(var i=0;i<this.length;++i){
    if(item == this[i]) {
      this.splice(i,1);
    }
  }
}

io.configure(function () {
  io.set("transports", ["xhr-polling"]);
  io.set("polling duration", 10);
});


app.use(express.static(__dirname));

app.use (
  express.static(__dirname + '/chat/public')
);

app.configure(function () {
    app.use(express.static(__dirname + 'webrtc/ice/page'));
});

//var port = process.env.PORT || 3000;
//server.listen(port);

var sockets = [];

app.get('/board', function (req, res) {
  res.sendfile(__dirname + '/board/index.html');
});

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

io.sockets.on('connection', function (socket) {
  sockets.push(socket);
  setListeners(socket);
  peopleOnline++;
  emitPeopleCount();
});

function setListeners(socket) {
    socket.on('line', function (data) {
            sendLine(data);
    });
    socket.on('disconnect', function() { 
      peopleOnline--; 
      emitPeopleCount();
      sockets.remove(socket);
      console.log(sockets.length);
    });
}

function emitPeopleCount() {
  for(var i=0;i<sockets.length;++i) {
      sockets[i].emit('people_count', { 'count': peopleOnline });
  }
}
function sendLine(data) {
    for(var i=0;i<sockets.length;++i) {
        sockets[i].emit('new_line', { 'line': data });
    }
}


// silly chrome wants SSL to do screensharing

//https.createServer({key: privateKey, cert: certificate}, app).listen(8000);
//http.createServer(app).listen(8001);
server.listen(8000);
//console.log('running on https://localhost:8000 and http://localhost:8001');

