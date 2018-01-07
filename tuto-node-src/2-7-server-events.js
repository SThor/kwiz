/**
 * Created by jeremiegarcia on 01/12/2017.
 */
var http = require("http");

var server = http.createServer();

server.on('request', function(req, res) {
    res.writeHead(200);
    res.end('Salut tout le monde !');
});

server.on('close', function() { // On écoute l'évènement close
    console.log('Bye bye !');
})

server.listen(8080); // Démarre le serveur

server.close(); // Arrête le serveur. Déclenche l'évènement close