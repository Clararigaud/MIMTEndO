window.addEventListener('tick', function (e) {
    drawMetronome();
    pickLed();
})

var a = 30;
var canvas = document.getElementById("tictac");
var ctx = canvas.getContext("2d");
var r = 100;
var a = 30;
var offset = [0, 50];
var counter = 0;

function drawMetronome() {
    a = -a;
    ctx.clearRect(0, 0, 300, 300);
    ctx.fillStyle = "red";
    ctx.strokeStyle = "white";
    var pos = getPos(a, r, offset);;
    ctx.beginPath();
    ctx.moveTo(offset[0], offset[1]);
    ctx.lineTo(pos[0], pos[1]);
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(pos[0], pos[1], 10, 0, 2 * Math.PI);
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.fill();
}

function getPos(a, r, offset) {
    var arad = a / 360 * Math.PI
    return [Math.cos(arad) * r + offset[0], Math.sin(arad) * r + offset[1]];
}

function pickLed(){
    var rem = document.querySelector(".steplight.active")
    if(rem){
        rem.classList.remove("active");
    }
    counter = counter % 4 + 1;
    document.querySelector("#steplight-" + String(counter)).classList.add("active");
    // console.log(counter);
}