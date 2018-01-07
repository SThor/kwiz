/**
 * Created by jeremiegarcia on 01/12/2017.
 */
var direBonjour = function() {
    console.log('Bonjour !');
}

var direByeBye = function() {
    console.log('Bye bye !');
}

var direTest = function (msg) {
    console.log('Test'+msg)
}

exports.direBonjour = direBonjour;
exports.saluer = direBonjour;
exports.direByeBye = direByeBye;
exports.direTest = direTest;
