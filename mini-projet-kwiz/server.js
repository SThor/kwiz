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
var playersAnswers = {};

for (let questionIdx = 0; questionIdx < (quiz.quiz.length); questionIdx++) {
    //extract content from the question
    question = quiz.quiz[questionIdx];
    questionId = question.id;

    playersAnswers[questionId] = {};
}

//communication protocol variables
const EVENT_QUIZ = "quiz";
const EVENT_CLIENT_COUNT = "client_count";
const EVENT_PLAYERS = "players";
const EVENT_LOGGED_IN = "logged_in";
const EVENT_ANSWER = "answer";
const EVENT_UPDATE_ANSWERS = "update_answers";
const EVENT_EVERY_PLAYER_ANSWERED = "every_player_answered";
const EVENT_WAITING_PAGE = "waiting_page";
const EVENT_TEST_NICKNAME = "test_nickname";
const EVENT_NICKNAME_TEST_RESPONSE = "nickname_test_response";


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

        //remove player answers from playersAnswers
        for(let qID=0;qID<quiz.quiz.length;qID++){
            let question = quiz.quiz[qID];
            delete playersAnswers[question.id][socket.id];
            updateAnswersCounters(question.id, null);
        }

        //remove player
        delete players[socket.id];
        io.emit(EVENT_PLAYERS,{players:players});

        if(clientCount === Object.keys(players).length){
            //send the questions to all clients
            io.emit(EVENT_QUIZ, quiz);
        }else{
            socket.emit(EVENT_WAITING_PAGE);
        }
    });

    socket.on(EVENT_TEST_NICKNAME, (data) => {
        testNickname(data,socket);
    });

    socket.on(EVENT_LOGGED_IN, (data) => {
        loggedIn(data,socket);
    });
});

function updateAnswersCounters(qID, socket) {
    var answersCounters = [];
    let questionAnswers = playersAnswers[qID];
    for(let uID in questionAnswers){
        if(!questionAnswers.hasOwnProperty(uID)) continue;

        let answer = questionAnswers[uID];
        if(answer in answersCounters){
            answersCounters[answer]++;
        }else{
            answersCounters[answer] = 1;
        }
    }
    io.emit(EVENT_UPDATE_ANSWERS,{qID: qID, answers:answersCounters});
}

function refreshScores() {
    for (let i = 0; i < Object.keys(players).length; i++) {
        let uID = Object.keys(players)[i];
        var score = 0;

        for (let qID = 0; qID < quiz.quiz.length; qID++) {
            let question = quiz.quiz[qID];

            //filter for questions that are finished
            let nbOfAnswers = 0;
            for (let i = 0; i < Object.keys(players).length; i++) {
                if (typeof (playersAnswers[question.id][Object.keys(players)[i]]) !== 'undefined') {
                    nbOfAnswers++;
                }
            }
            if (nbOfAnswers === Object.keys(players).length) {
                let userAnswer = quiz.quiz[qID].options[playersAnswers[question.id][uID]];
                if (userAnswer === question.answer) {
                    score++;
                }
            }
        }
        players[uID].score = score;
    }
    io.emit(EVENT_PLAYERS, {players: players});
}

function answered(data, socket) {
    let garbage = 'radio_' + data.qID + '_';
    playersAnswers[data.qID][data.uID] = data.optionId.replace(garbage,'');

    updateAnswersCounters(data.qID, socket);

    let nbOfAnswers = 0;
    for(let i=0; i<Object.keys(players).length; i++){
        if(typeof (playersAnswers[data.qID][Object.keys(players)[i]]) !== 'undefined'){
            nbOfAnswers++;
        }
    }

    if(nbOfAnswers === Object.keys(players).length){
        console.log('Every player answered question '+data.qID);
        //prevent clients to change answer
        //show answer for question to clients
        //compute & send scores

        let qNumber = data.qID.replace('q','') - 1;

        io.emit(EVENT_EVERY_PLAYER_ANSWERED,{qID:data.qID,answer:quiz.quiz[qNumber].answer});

        refreshScores();
    }
}

function loggedIn(data,socket){
    console.log("login de "+data["nickname"]);

    players[socket.id] = {id:socket.id,nickname:data['nickname'],score:0};
    io.emit(EVENT_PLAYERS,{players:players});

    for (let questionIdx = 0; questionIdx < (quiz.length); questionIdx++) {
        //extract content from the question
        question = quiz[questionIdx];
        questionId = question.id;
    }

    socket.on(EVENT_ANSWER, answered);


    if(clientCount === Object.keys(players).length){
        //send the questions to all clients
        io.emit(EVENT_QUIZ, quiz);
    }else{
        socket.emit(EVENT_WAITING_PAGE);
    }
}

function testNickname(data, socket) {
    var nickTaken = 0;

    for(let i=0; i<Object.keys(players).length; i++) {
        let player = players[Object.keys(players)[i]];
        nickTaken += (data.nickname === player.nickname);
        console.log(data.nickname, player.nickname, nickTaken);
    }

    socket.emit(EVENT_NICKNAME_TEST_RESPONSE,{nicknameTaken:nickTaken,nickname:data.nickname});
}

server.listen(8080,"0.0.0.0");