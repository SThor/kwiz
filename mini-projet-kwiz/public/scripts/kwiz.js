//communication protocol variables
const EVENT_CLIENT_COUNT = "client_count";
const EVENT_PLAYERS = "players";
const EVENT_LOGGED_IN = "logged_in";
const EVENT_ANSWER = "answer";
const EVENT_UPDATE_ANSWERS = "update_answers";
const EVENT_DESELECT = "deselect";

var kwiz;
kwiz = {
    socket: 'undefined',
    content: 'undefined'
};

//retrieve UI elements and start communication with the server
kwiz.start = function (socket) {
    //retrieve the content
    kwiz.content = document.getElementById('content');

    //init communication
    kwiz.socket = socket;
    kwiz.socket.on('quiz', kwiz.createQuestionsUiFromData);

    kwiz.socket.on(EVENT_UPDATE_ANSWERS, kwiz.updateAnswers);
};

//use a description object to create the UI
kwiz.createQuestionsUiFromData = function (data) {

    //remove existing components if any in the content
    while (kwiz.content.firstChild) {
        kwiz.content.removeChild(kwiz.content.firstChild);
    }

    //extract some content from the data
    var quiz = data.quiz; //quiz is an array of questions
    var nbQuestions = quiz.length;

    //variables declaration

    //variables in the loop
    var question, questionId, title, answer, options;
    var p_title, questionDiv, radioDiv;

    //variables in the nested loop
    var nbOptions;
    var option, label, labelID, radio, radioID, br, span, p_answers, p_answersID;

    for (let questionIdx = 0; questionIdx < nbQuestions; questionIdx++) {
        //extract content from the question
        question = quiz[questionIdx];
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
        radioDiv.setAttribute("class", "options radio");

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
            label.setAttribute('class', 'option');
            label.answer = answer;
            label.innerHTML = option;

            radio = document.createElement('input');
            radio.setAttribute("type", "radio");
            radio.setAttribute("value", option);
            radio.setAttribute("id", radioID);
            radio.setAttribute("name", questionId); //pour grouper les radio buttons niveau comportement
            radio.answer = answer;
            kwiz.createClickListener(radio);

            p_answers = document.createElement('p');
            p_answers.setAttribute('id', p_answersID);

            //add a br to change line
            br = document.createElement('br');

            //add the elements to the radio div
            radioDiv.appendChild(radio);
            radioDiv.appendChild(label);
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

    radio.onclick = function () {
        var options = document.querySelectorAll("input[type='radio']:checked");

        var checkedAnswers = [];

        for(var key in options){
            if(!options.hasOwnProperty(key)) continue;
            checkedAnswers.push(options[key].attributes.id.value);
        }

        kwiz.socket.emit(EVENT_ANSWER,{uID:kwiz.socket.id, qID:questionId, options:checkedAnswers});
    };
};


kwiz.updateAnswers = function (data) {
    var answers = data['answers'];

    //clear answers counters
    var answersP = document.querySelectorAll(".radio p");
    for(var i=0; i<answersP.length; i++){
        var paragraph = answersP[i];
        paragraph.innerText = '';
    }


    for(var answer in answers){
        if(!answers.hasOwnProperty(answer)) continue;

        var paragraphID = answer.replace("radio","p");


        var text;
        if(answers[answer]>1){
            text = "joueurs ont choisi cette réponse";
        }else{
            text = "joueur a choisi cette réponse";
        }
        document.getElementById(paragraphID).innerHTML = '('+answers[answer]+" "+text+')';
    }
};