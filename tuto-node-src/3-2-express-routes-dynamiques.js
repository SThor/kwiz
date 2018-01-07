var express = require('express');

var app = express();

app.get('/', function(req, res) {
    res.setHeader('Content-Type', 'text/plain; charset=UTF-8');
    res.end('Vous êtes à l\'accueil, que puis-je pour vous ?');
});

app.get('/etage/:etagenum/chambre', function(req, res) {
    res.setHeader('Content-Type', 'text/plain;  charset=UTF-8');
    if(req.params.etagenum < 0 || req.params.etagenum > 100){
        res.end("Il n'y a pas de chambre à l'étage n°"+req.params.etagenum);
    }else{
        res.end('Vous êtes à la chambre de l\'étage n°' + req.params.etagenum);
    }
});

app.use(function(req, res, next){
    res.setHeader('Content-Type', 'text/plain;  charset=UTF-8');
    res.status(404).send('Page introuvable !');
});

app.listen(8080);