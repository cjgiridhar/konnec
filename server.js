var express = require('express');
var app = express();
var fs = require('fs');
var webshot = require('webshot');

//var privateKey = fs.readFileSync('fakekeys/server.key').toString(),
//    certificate = fs.readFileSync('fakekeys/server.crt').toString();

//var privateKey = fs.readFileSync('fakekeys/privatekey.pem').toString(),
//    certificate = fs.readFileSync('fakekeys/certificate.pem').toString();

//var server = require('https').createServer({key: privateKey, cert: certificate}, app);
var server = require('http').createServer(app); 

var socket = require('socket.io');
var io = socket.listen(server);
var peopleOnline = 0;
var https = require('https');
var http = require('http');

var  uuid, ws;

ws = require('websocket.io');
uuid = require('node-uuid');

var jade = require('jade');
// var io = require('socket.io').listen(app);
var pseudoArray = ['admin']; //block the admin username (you can disable it)

// Views Options

app.set('views', __dirname + '/chats/views');
app.set('view engine', 'jade');
app.set("view options", { layout: false })



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

app.configure(function() {
	app.use(express.static(__dirname + '/chats/public'));
});

// Render and send the main page

app.get('/chats', function(req, res){
  res.render('home.jade');
});

var users = 0; //count the users

io.sockets.on('connection', function (socket) { // First connection
	users += 1; // Add 1 to the count
	reloadUsers(); // Send the count to all the users
	socket.on('message', function (data) { // Broadcast the message to all
		if(pseudoSet(socket))
		{
			var transmit = {date : new Date().toISOString(), pseudo : returnPseudo(socket), message : data};
			socket.broadcast.emit('message', transmit);
			console.log("user "+ transmit['pseudo'] +" said \""+data+"\"");
		}
	});
	socket.on('setPseudo', function (data) { // Assign a name to the user
		if (pseudoArray.indexOf(data) == -1) // Test if the name is already taken
		{
			socket.set('pseudo', data, function(){
				pseudoArray.push(data);
				socket.emit('pseudoStatus', 'ok');
				console.log("user " + data + " connected");
			});
		}
		else
		{
			socket.emit('pseudoStatus', 'error') // Send the error
		}
	});
	socket.on('disconnect', function () { // Disconnection of the client
		users -= 1;
		reloadUsers();
		if (pseudoSet(socket))
		{
			var pseudo;
			socket.get('pseudo', function(err, name) {
				pseudo = name;
			});
			var index = pseudoArray.indexOf(pseudo);
			pseudo.slice(index - 1, 1);
		}
	});
});

function reloadUsers() { // Send the count of the users to all
	io.sockets.emit('nbUsers', {"nb": users});
}
function pseudoSet(socket) { // Test if the user has a name
	var test;
	socket.get('pseudo', function(err, name) {
		if (name == null ) test = false;
		else test = true;
	});
	return test;
}
function returnPseudo(socket) { // Return the name of the user
	var pseudo;
	socket.get('pseudo', function(err, name) {
		if (name == null ) pseudo = false;
		else pseudo = name;
	});
	return pseudo;
}

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


///////////////////////////// Code share

sharejs = require('share').server;
var options = {db:{type:'none'}}; // See docs for options. {type: 'redis'} to enable     persistance.

// Attach the sharejs REST and Socket.io interfaces to the server
sharejs.attach(app, options);

app.use(app.router);

app.set('views', __dirname + '/chats/views');
app.engine('html', require('ejs').renderFile);
app.get('/share', function(req, res) {
    res.render('share.html');
});

/////Screenshot

app.get('/capture', function(req, res) {	
				webshot('google.com', 'google.png', function(err) {
  					// screenshot now saved to google.png
				});
});				
// silly chrome wants SSL to do screensharing

//https.createServer({key: privateKey, cert: certificate}, app).listen(8000);
//http.createServer(app).listen(8001);
var port = process.env.PORT || 3000;
console.log( port );
server.listen(port);
//console.log('running on https://localhost:8000 and http://localhost:8001');

