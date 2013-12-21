var express = require('express');
var app = express();
server = require('http').createServer(app);
var socket = require('socket.io');
var io = socket.listen(server);
var peopleOnline = 0;

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

app.use (
  express.static(__dirname + '/public')
);

var port = process.env.PORT || 3000;
server.listen(port);
var sockets = [];

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
var fs1 = require('fs'),
    express1 = require('express'),
    https1 = require('https'),
    http1 = require('http');

var app1, express1, io1, server1, uuid1, ws1;

ws1 = require('websocket.io');
uuid1 = require('node-uuid');

var privateKey = fs.readFileSync('fakekeys/privatekey.pem').toString(),
    certificate = fs.readFileSync('fakekeys/certificate.pem').toString();


var app1 = express();
app1.use(express.static(__dirname));

app1.configure(function () {
    app1.use(express.static(__dirname + 'webrtc/ice/page'));
});

app.get('/chat', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});


https1.createServer({key: privateKey, cert: certificate}, app1).listen(8000);
http1.createServer(app1).listen(8001);

console.log('running on https://localhost:8000 and http://localhost:8001');
