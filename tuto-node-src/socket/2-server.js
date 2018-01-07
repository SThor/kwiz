
var http = require('http');
var fs = require('fs');

// Chargement du fichier 1-index.html affiché au client
var server = http.createServer(function(req, res) {
    fs.readFile('./2-index.html', 'utf-8', function(error, content) {
        res.writeHead(200, {"Content-Type": "text/html"});
        res.end(content);
    });
});

// Chargement de socket.io
var io = require('socket.io').listen(server);

// Quand un client se connecte, on le note dans la console
io.sockets.on('connection', function (socket) {
    console.log('Un client est connecté !');
    socket.emit('message', { content: 'Vous êtes bien connecté !', importance: '1' });
});


server.listen(8080);