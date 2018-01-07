var http = require('http');

var server = http.createServer(function(req, res) {
  res.writeHead(404);
  res.end('Page non trouvée');
});
server.listen(8080);