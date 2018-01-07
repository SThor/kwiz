/**
 * Created by jeremiegarcia on 10/10/2017.
 * this code is using JQuery.js, Interact.js and AudioMixer.js
 */

var Interface = {
    userId: 1,
    topZIndex: 0,
    validIds: [],
};

Interface.fromPixelsToUnits = function (coords, target) {
    //get the container
    var parent = $("#container");
    //width/heigh is the container width/height minus element width/height
    var width = parent.width() - target.offsetWidth;
    var height = parent.height() - target.offsetHeight;

    //since Interact.js use transform we need to retrieve the translation and remove the initial offset
    var x = coords[0] + target.offsetLeft - parent.offset().left;
    var y = coords[1] + target.offsetTop - parent.offset().top;

    var gain = 1 -  y / height;
    var pan = -1 + (x / width) * 2;

    return [gain, pan];
};

Interface.dragMoveListener = function (event) {
    var target = event.target,
        // keep the dragged position in the data-x/data-y attributes
        x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
        y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

    Interface.updatePositions(target, [x, y]);

    //increase Z order to display on top
    target.style.zIndex = Interface.topZIndex++;

    // find corresponding soundNode id
    var id = parseInt(target.id.substring(5, 6));

    // computer gain and pan values
    var res = Interface.fromPixelsToUnits([x,y],target);
    Mixer.updateValues(id, res[0], res[1]);
};

Interface.initInteractions = function () {
    // target elements with the "draggable" class
    interact('.draggable')
        .draggable({
            // enable inertial throwing
            inertia: false,
            // keep the element within the area of it's parent
            restrict: {
                restriction: "parent",
                endOnly: false,
                elementRect: {top: 0, left: 0, bottom: 1, right: 1}
            },
            // enable autoScroll
            autoScroll: false,

            // call this function on every dragmove event
            onmove: Interface.dragMoveListener,
            // call this function on every dragend event
            onend: function (event) {

            }
        });
    $("#audioToggleInput").change(function() {
        if(this.checked) {
           Mixer.startSounds();
        }else{
            Mixer.stopSounds();
        }
    });
};

Interface.updatePositions = function (target, coords) {
    // translate the element
    target.style.webkitTransform =
        target.style.transform =
            'translate(' + coords[0] + 'px, ' + coords[1] + 'px)';

    // update the position attributes
    target.setAttribute('data-x', coords[0]);
    target.setAttribute('data-y', coords[1]);
};

Interface.toggleAudio = function (){

};

//init Objects
Mixer.initAudio();
Interface.initInteractions();