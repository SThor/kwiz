/**
 * Created by jgarcia on 01/12/2017.
 */

var fs = require('fs');
var favicon = require('serve-favicon');
var path = require('path');
var express = require('express');
var app = express();

//load questions file
var quiz = require('./data/bluffer.json');

//make the server and the socketsio
var server = require('http').createServer(app);
var io = require('socket.io')(server);

//data variables
var players = {};       //logged-in players
var clientCount = 0;    //all sockets counter
var answers = {};       //counters for each option of each question
var questionStatus = {};

for (let questionIdx = 0; questionIdx < (quiz.quiz.length); questionIdx++) {
    //extract content from the question
    question = quiz.quiz[questionIdx];
    questionId = question.id;

    questionStatus[questionId] = {};
}

//communication protocol variables
const EVENT_CLIENT_COUNT = "client_count";
const EVENT_PLAYERS = "players";
const EVENT_LOGGED_IN = "logged_in";
const EVENT_ANSWER = "answer";
const EVENT_UPDATE_ANSWERS = "update_answers";
const EVENT_DESELECT = "deselect";

//server static file in the public directory
app.use(express.static('public'))
    .use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

// client connexion
io.on('connection', function (socket) {
    clientCount++;
    io.emit(EVENT_CLIENT_COUNT,{'count':clientCount});

    socket.emit(EVENT_PLAYERS,{players:players});

    console.log("new client #"+clientCount);

    socket.on('disconnect', function () {
        clientCount--;
        io.emit(EVENT_CLIENT_COUNT,{'count':clientCount});
        console.log("clients left : "+clientCount);

        delete players[socket.id];
        io.emit(EVENT_PLAYERS,{players:players});
    });

    socket.on(EVENT_LOGGED_IN, (data) => {
        console.log(data);
        loggedIn(data,socket);
    });
});

function answered(data, socket) {
    answers[data.uID]=data.options;

    var answersCounters = {};

    for (var key in answers){
        if(!answers.hasOwnProperty(key)) continue;

        var uAnswers = answers[key];

        for(var i=0; i<uAnswers.length; i++){
            var radio = uAnswers[i];
            if(radio in answersCounters){
                answersCounters[radio]++;
            }else{
                answersCounters[radio] = 1;
            }
        }
    }

    questionStatus[data.qID][data.uID] = true;

    var everyPlayerAnswered = false;
    for(var i=0; i<Object.keys(players).length; i++){
        everyPlayerAnswered += questionStatus[data.qID][Object.keys(players)[i]];
    }

    if(everyPlayerAnswered){
        console.log('Every player answered question '+data.qID);
    }

    io.emit(EVENT_UPDATE_ANSWERS,{answers:answersCounters});
}

function loggedIn(data,socket){
    console.log("login de "+data["nickname"]);

    players[socket.id] = {id:socket.id,nickname:data['nickname'],score:0};

    for (let questionIdx = 0; questionIdx < (quiz.length); questionIdx++) {
        //extract content from the question
        question = quiz[questionIdx];
        questionId = question.id;

        questionStatus[questionId][socket.id] = false;
    }

    io.emit(EVENT_PLAYERS,{players:players});

    //socket.on(EVENT_DESELECT, deselected);
    socket.on(EVENT_ANSWER, answered);

    //send the questions to the client
    socket.emit("quiz", quiz);
}

server.listen(8080,"0.0.0.0");