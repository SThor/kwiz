/**
* Mixer class that takes care of creating audio elements
* and add the to the pan + gain pipeline.
* Set up the parameters in the construtor.
* then call Mixer.initAudio(), then Mixer.startsounds();
* to change the parameters use the updateValues method.
* 
* Created by Jeremie Garcia <jeremie.garcia@enac.fr>, 24/08/2017.
*/
var Mixer = {
    nbSound : 4,
    folder_path : './sounds/',
    initialGain : 0,
    initialPan : 0,
    sounds: [],
    gainNodes: [],
    panNodes: [],
    audioCtx: new (window.AudioContext || window.webkitAudioContext)(),
};

Mixer.initAudio = function () {
    // for each sound use the following pipeline:
    // Create an Audio object,
    // convert it as a node,
    // plug into a gain,
    // plug into a panner,
    // plug to audio out
    // export relevant Variables to change values
     var audioCtx = this.audioCtx;

    for (var i = 1; i < this.nbSound + 1; i++) {

        var sound = document.createElement('audio');
        sound.src = this.folder_path + i + '.wav';
        sound.loop = true;
        var soundNode = audioCtx.createMediaElementSource(sound);
        var gainNode = audioCtx.createGain();
        gainNode.gain.value = this.initialGain;
        var panNode = audioCtx.createStereoPanner();
        panNode.pan.value = this.initialPan;
        soundNode.connect(panNode);
        panNode.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        this.sounds[i] = sound;
        this.gainNodes[i] = gainNode;
        this.panNodes[i] = panNode;
    }
};

//starts all sounds at once (no necessarily in sync)
Mixer.startSounds = function () {
    for (var count = 1; count < 5; count++) {
        this.sounds[count].play();
    }
};

//stop all the sounds
Mixer.stopSounds = function () {
    for (var count = 1; count < 5; count++) {
        this.sounds[count].pause();
    }
};

//update the  gain and pan values of a given node
//id is an integer representing the sound index
// gain [0, 1] is the gain in percentage (0 is silent and 1 is maximum)
// pan [-1,1] is the pan value (-1 is left, 0 is center and 1 is right)
Mixer.updateValues = function (id, gain, pan) {

    gain = Math.min(1, gain);
    gain = Math.max(0, gain);
    gain = gain || 0;

    pan = Math.max(-1, pan);
    pan = Math.min(1, pan);
    pan = pan || 0;

    this.gainNodes[id].gain.value = gain;
    this.panNodes[id].pan.value = pan;
}