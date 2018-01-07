var http = require('http');

var reply = function(req, res) {
  res.writeHead(200);
  res.end('Salut tout le monde !');
  console.log(req)
}

var server = http.createServer(reply);
server.listen(8080);