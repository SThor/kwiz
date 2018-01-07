var http = require('http');
var url = require('url');

var server = http.createServer(function(req, res) {
    var page = url.parse(req.url).pathname;
    console.log(page);

    switch (page){
        case "/":
            res.writeHead(200, {"Content-Type": "text/plain"});
            res.write('Bonjour');
            break;
        case "/byebye":
            res.writeHead(200, {"Content-Type": "text/plain"});
            res.write('Au revoir');
            break;
        default:
            res.writeHead(404, {"Content-Type": "text/plain"});
            res.write('Page non trouvée');
    }

    res.end();
});
server.listen(8080);