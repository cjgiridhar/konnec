// silly chrome wants SSL to do screensharing
var fs = require('fs'),
    express = require('express'),
    https = require('https'),
    http = require('http');

var app, express, io, server, uuid, ws;

ws = require('websocket.io');
uuid = require('node-uuid');

var privateKey = fs.readFileSync('fakekeys/privatekey.pem').toString(),
    certificate = fs.readFileSync('fakekeys/certificate.pem').toString();


var app = express();
app.use(express.static(__dirname));
app.configure(function () {
    app.use(express.static(__dirname + '/ice/page'));
});


https.createServer({key: privateKey, cert: certificate}, app).listen(8000);
http.createServer(app).listen(8001);

console.log('running on https://localhost:8000 and http://localhost:8001');
