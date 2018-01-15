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

var kwiz;
kwiz = {
    socket: 'undefined',
    content: 'undefined',
    quiz: 'undefined'
};


//retrieve UI elements and start communication with the server
kwiz.start = function (socket) {
    //retrieve the content
    kwiz.content = document.getElementById('content');

    //init communication
    kwiz.socket = socket;

    kwiz.socket.on(EVENT_WAITING_PAGE, kwiz.createWaitingPage);

    kwiz.socket.on(EVENT_QUIZ, kwiz.createQuestionsUiFromData);

    kwiz.socket.on(EVENT_UPDATE_ANSWERS, kwiz.updateAnswers);
};

kwiz.createWaitingPage = function () {
    //remove existing components if any in the content
    while (kwiz.content.firstChild) {
        kwiz.content.removeChild(kwiz.content.firstChild);
    }

    var title, counterP;
    title = document.createElement("h1");
    title.innerHTML = "Waiting for all players to login <span id='wait'>.</span>";
    title.setAttribute("class","text-center");

    var clientsCount = document.getElementById("clientCount").innerHTML.substr(0,1);
    var playersCount = document.getElementById("playersTable").rows.length-1;

    counterP = document.createElement("p");
    counterP.innerHTML = "Logged-in players: <span id='wait_counter'>"+playersCount+"/"+clientsCount+"</span>";
    counterP.setAttribute("class","text-center");

    window.dotsGointUp = true;
    var dots = window.setInterval( function () {
       var wait = document.getElementById("wait");
       if(typeof wait !== 'undefined' && wait!== null){
           if(window.dotsGointUp){
               wait.innerHTML += ".";
           }else{
               wait.innerHTML = wait.innerHTML.substring(1, wait.innerHTML.length);
               if(wait.innerHTML === "")
                   window.dotsGointUp = true;
           }
           if( wait.innerHTML.length > 6 )
               window.dotsGointUp = false;
       }
    }, 100);

    kwiz.content.appendChild(title);
    kwiz.content.appendChild(counterP);
};

//use a description object to create the UI
kwiz.createQuestionsUiFromData = function (data) {

    //remove existing components if any in the content
    while (kwiz.content.firstChild) {
        kwiz.content.removeChild(kwiz.content.firstChild);
    }

    //extract some content from the data
    kwiz.quiz = data.quiz; //quiz is an array of questions
    var nbQuestions = kwiz.quiz.length;

    //variables declaration

    //variables in the loop
    var question, questionId, title, answer, options;
    var p_title, questionDiv, radioDiv;

    //variables in the nested loop
    var nbOptions;
    var option, formCheckDiv, label, labelID, radio, radioID, br, span, p_answers, p_answersID;

    for (let questionIdx = 0; questionIdx < nbQuestions; questionIdx++) {
        //extract content from the question
        question = kwiz.quiz[questionIdx];
        questionId = question.id;
        title = question.question;
        answer = question.answer;
        options = question.options;
        nbOptions = options.length;

        //create the content div
        questionDiv = document.createElement('div');
        questionDiv.setAttribute('class', 'question-block row');
        questionDiv.setAttribute('id', questionId);

        //create a paragraph to display the question
        p_title = document.createElement('p');
        p_title.setAttribute('class', 'question');
        p_title.innerHTML = title;

        //create a div that will be a radio button (BootStrap) content
        radioDiv = document.createElement("div");
        radioDiv.setAttribute("class", "options radio row");

        //iterate over each options to create the radio buttons and labels
        for (let optionID = 0; optionID < nbOptions; optionID++) {

            //get the option text
            option = options[optionID];

            //create a label and radio button for each option
            labelID = 'label_' + questionId + '_' + optionID;
            radioID = 'radio_' + questionId + '_' + optionID;
            p_answersID = 'p_' + questionId + '_' + optionID;

            label = document.createElement('label');
            label.setAttribute("value", option);
            label.setAttribute('for', radioID);
            label.setAttribute('id', labelID);
            label.setAttribute('name', questionId);
            label.setAttribute('class', 'option form-check-label');
            label.answer = answer;
            label.innerHTML = option;

            radio = document.createElement('input');
            radio.setAttribute("type", "radio");
            radio.setAttribute("value", option);
            radio.setAttribute("id", radioID);
            radio.setAttribute("name", questionId); //pour grouper les radio buttons niveau comportement
            radio.setAttribute("class","form-check-input");
            radio.answer = answer;
            kwiz.createClickListener(radio);

            p_answers = document.createElement('p');
            p_answers.setAttribute('id', p_answersID);
            p_answers.setAttribute('class', 'col-md-5  text-right');

            //add a br to change line
            br = document.createElement('br');

            formCheckDiv = document.createElement('div');
            formCheckDiv.setAttribute("class","form-check col-md-7");

            formCheckDiv.appendChild(radio);
            formCheckDiv.appendChild(label);


            //add the elements to the radio div
            radioDiv.appendChild(formCheckDiv);
            radioDiv.appendChild(p_answers);
            radioDiv.appendChild(br);
        }

        //add the elements to the quesiton div and content
        questionDiv.appendChild(p_title);
        questionDiv.appendChild(radioDiv);
        kwiz.content.appendChild(questionDiv);
    }
};

kwiz.createClickListener = function (radio) {
    var questionId = radio.getAttribute('name');
    var option = radio.getAttribute('value');
    var optionId = radio.getAttribute('id');

    radio.onclick = function () {
        var options = document.querySelectorAll("input[type='radio']:checked");

        var checkedAnswers = [];

        for(let key in options){
            if(!options.hasOwnProperty(key)) continue;
            checkedAnswers.push(options[key].attributes.id.value);
        }

        kwiz.socket.on(EVENT_EVERY_PLAYER_ANSWERED,kwiz.everyPlayerAnswered);
        kwiz.socket.emit(EVENT_ANSWER,{uID:kwiz.socket.id, qID:questionId, optionId:optionId, options:checkedAnswers});
    };
};


kwiz.updateAnswers = function (data) {
    var answers = data['answers'];

    //clear answers counters
    var answersP = document.querySelectorAll("#"+data.qID+" .radio p");
    for(var i=0; i<answersP.length; i++){
        var paragraph = answersP[i];
        paragraph.innerHTML = '';
    }


    for(var optionID in answers){
        if(!answers.hasOwnProperty(optionID) || answers[optionID]=== null) continue;

        var paragraphID = 'p_' + data.qID + '_' + optionID;

        var text;
        if(answers[optionID]>1){
            text = "joueurs ont choisi cette réponse";
        }else{
            text = "joueur a choisi cette réponse";
        }
        document.getElementById(paragraphID).innerHTML = '('+answers[optionID]+" "+text+')';
    }
};

kwiz.everyPlayerAnswered = function(data){
    //prevent from changing answer
    var qID = data.qID;

    var qNumber = data.qID.replace('q','') - 1;
    question = kwiz.quiz[qNumber];

    for(let optionID = 0; optionID < question.options.length; optionID++){
        var option = question.options[optionID];

        var radioID = 'radio_' + qID + '_' + optionID;
        document.getElementById(radioID).disabled = true;

        var labelID = 'label_' + qID + '_' + optionID;
        if(option === data.answer){
            document.getElementById(labelID).style.color = "green";
        }else{
            document.getElementById(labelID).style.color = "red";
        }
    }
};