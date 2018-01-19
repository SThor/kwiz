var graphloaded = 0;

function drawChart() {
    //populate graph for ending
    kwiz.graphData = new google.visualization.DataTable();
    kwiz.graphData.addColumn('string', 'Joueur');
    kwiz.graphData.addColumn('number', 'Score');
    graphloaded = 1;
}

let socket = io(); //'http://localhost:8080'

socket.on(EVENT_CLIENT_COUNT, (data) => {
    let text;
    if (data["count"] > 1) {
        text = " clients en ligne."
    } else {
        text = " client en ligne."
    }
    document.getElementById("clientCount").innerText = data["count"] + text;

    let waitCounter = document.getElementById("wait_counter");
    if (typeof waitCounter !== 'undefined' && waitCounter !== null) {
        waitCounter.innerHTML = document.getElementById("playersTable").rows.length - 1 + "/" + data.count;
    }
});

socket.on(EVENT_PLAYERS, (data) => {
    let players = data['players'];
    let playersTable = document.getElementById("playersTable");

    while (playersTable.children[1]) {
        playersTable.removeChild(playersTable.children[1]);
    }

    for (let playerID in players) {
        if (players.hasOwnProperty(playerID)) {
            let line = document.createElement('tr');

            /*id = document.createElement('td');
            id.innerHTML = players[playerID].id;
            line.appendChild(id);*/

            let nickname = document.createElement('td');
            nickname.innerHTML = players[playerID].nickname;
            line.appendChild(nickname);

            let score = document.createElement('td');
            score.innerHTML = players[playerID].score;
            line.appendChild(score);
            if (playerID === socket.id) {
                document.getElementById("player_score").innerText = "Score : " + players[playerID].score;
            }

            playersTable.appendChild(line);

            //populate graph for end stats, only if graph has already been loaded
            if (graphloaded === 1) {
                //update row, or add it if it does not exists
                let found = 0;
                for (let i = 0; i < kwiz.graphData.getNumberOfRows(); i++) {
                    if (kwiz.graphData.getValue(i, 0) === players[playerID].nickname) {
                        found = 1;
                        kwiz.graphData.setValue(i, 1, players[playerID].score);
                    }
                }
                if (found === 0) {
                    kwiz.graphData.addRow([players[playerID].nickname, players[playerID].score]);
                }
                kwiz.graphData.sort([{column: 1, desc: true}, {column: 0}]);
                console.log(players[playerID].nickname, players[playerID].score);
                var options = {'title': 'Scores finaux'};
                var chart = new google.visualization.BarChart(document.getElementById("googlechart"));
                chart.draw(kwiz.graphData, options);
            }
        }
    }

    let nbPlayers = playersTable.rows.length - 1;
    if (nbPlayers > 0) {
        document.getElementById('nb_of_players').innerHTML = "Nombre de joueurs : " + nbPlayers;
    }

    //update the counter on the waiting page, if it still exists
    let waitCounter = document.getElementById("wait_counter");
    if (typeof waitCounter !== 'undefined' && waitCounter !== null) {
        let clientsCount = document.getElementById("clientCount").innerHTML.substr(0, 1);
        waitCounter.innerHTML = nbPlayers + "/" + clientsCount;
    }
});

function login() {
    let nickname = document.getElementById("nickname").value;

    if (nickname === "") {
        document.getElementById("alert_container").innerHTML = "<div class='alert alert-warning alert-dismissable'><a href='#' class='close' data-dismiss='alert' aria-label='close'>&times;</a><strong>Attention !</strong> Vous n'avez pas entré de pseudo.</div>";
    } else {
        socket.on(EVENT_NICKNAME_TEST_RESPONSE, nicknameTestResponse);
        socket.emit(EVENT_TEST_NICKNAME, {id: socket["id"], nickname: nickname});
    }
}

function nicknameTestResponse(data) {
    if (data.nicknameTaken === 0) {
        document.getElementById('player_name').innerHTML = "Pseudo : " + data.nickname;
        socket.emit(EVENT_LOGGED_IN, {id: socket["id"], nickname: data.nickname});
        kwiz.start(socket);
    } else {
        document.getElementById("alert_container").innerHTML = "<div class='alert alert-danger alert-dismissable'><a href='#' class='close' data-dismiss='alert' aria-label='close'>&times;</a><strong>Attention !</strong> Ce pseudo est déjà pris.</div>";
    }
}

google.charts.load('current', {'packages': ['corechart']});
google.charts.setOnLoadCallback(drawChart);