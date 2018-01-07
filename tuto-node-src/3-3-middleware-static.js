var express = require('express');
var favicon = require('serve-favicon');
var path = require('path');

var app = express();

app.use(express.static('public'))
    .use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.listen(8080);