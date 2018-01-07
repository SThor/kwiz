
var http = require('http');
var fs = require('fs');

var clientCount = 0;

// Chargement du fichier 1-index.html affiché au client
var server = http.createServer(function(req, res) {
    fs.readFile('./index.html', 'utf-8', function(error, content) {
        res.writeHead(200, {"Content-Type": "text/html"});
        res.end(content);
    });
});

// Chargement de socket.io
var io = require('socket.io').listen(server);

// Quand un client se connecte, on le note dans la console
io.sockets.on('connection', function (socket) {
    clientCount++;
    io.emit('new_client');
    console.log('Un client est connecté !');

    io.emit('clientCount',{'count':clientCount});

    socket.on('disconnect', function (socket) {
        clientCount--;
        io.emit('client_left');
        console.log('Un client est parti !');

        io.emit('clientCount',{'count':clientCount});
    });
});

server.listen(8080);