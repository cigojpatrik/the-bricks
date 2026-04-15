var x = 150;
var y = 200;
var dx = 2;
var dy = 4;
var WIDTH;
var HEIGHT;
var r = 10;
var f = 0;
var ctx;
var intervalId;
var timerId;
var level = 1;

var paddlecolor = "#0f2742";
var ballcolor = "#bae6fd";
var brickcolors = {
    1: "#6385a0",
    2: "#75a9d6",
    3: "#84c5ff"
};

var start = true;
var tocke;
var sekunde;
var izpisTimer;

var paddlex;
var paddleh;
var paddlew;


var rightDown = false;
var leftDown = false;

var bricks;
var NROWS;
var NCOLS;
var BRICKWIDTH;
var BRICKHEIGHT;
var PADDING;
var gameWon = false;
var cakaNaStart = true;

var bgImage = new Image();
bgImage.src = "img/background.png";

var paddleImage = new Image();
paddleImage.src = "img/paddle.png";

function updateLevelDisplay() {
    $("#level").html(level);
}

function resetBall() {
    x = 377;
    y = 500;
    dx = 0;
    dy = 4;
    start = true;
}
function startGame() {
    if (cakaNaStart) {
        dx = 2;
        dy = -4;
        start = true;
        cakaNaStart = false;
    }
}
function resetGame() {
    clearInterval(intervalId);
    clearInterval(timerId);

    level = 1;
    gameWon = false;
    rightDown = false;
    leftDown = false;

    init();
}

function init() {
    ctx = $("#canvas")[0].getContext("2d");
    WIDTH = $("#canvas").width();
    HEIGHT = $("#canvas").height();
    resetBall();
    init_paddle();
    initbricks();
    sekunde = 0;
    izpisTimer = "00:00";
    tocke = 0;
    updateLevelDisplay();
    $("#cas").html(izpisTimer);
    $("#tocke").html(tocke);
	
	cakaNaStart = true;
	start = false;
	dx = 0;
	dy = 0;
	
    intervalId = setInterval(draw, 10);
    timerId = setInterval(timer, 1000);
}

function init_paddle() {
    paddlex = WIDTH / 2.5;
    paddleh = 25;

    paddlew = 180;
}

function initbricks() {
    if(level==1){
        NROWS = 3;
        NCOLS = 4;
    }else if(level==2){
        NROWS = 3;
        NCOLS = 6;
    }else if(level==3){
        NROWS = 3;
        NCOLS = 8;
    }else{
        NROWS = 2;
        NCOLS = 2;
    }
    BRICKWIDTH = (WIDTH / NCOLS) - 1;
    BRICKHEIGHT = 30;
    PADDING = 1;
    bricks = new Array(NROWS);



    for (var i = 0; i < NROWS; i++) {
        bricks[i] = new Array(NCOLS);
        for (var j = 0; j < NCOLS; j++) {
            bricks[i][j] = Math.floor(Math.random() * 3) + 1;
        }
    }
}

function circle(x, y, r) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();
}

function rect(x, y, w, h) {
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.closePath();
    ctx.fill();
}

function clear() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
}

function allBricksDestroyed() {
    for (var i = 0; i < NROWS; i++) {
        for (var j = 0; j < NCOLS; j++) {
            if (bricks[i][j] > 0) {
                return false;
            }
        }
    }

    return true;
}

function timer() {
    var sekundeI;
    var minuteI;

    if (start == true) {
        sekunde++;
        sekundeI = ((sekundeI = (sekunde % 60)) > 9) ? sekundeI : "0" + sekundeI;
        minuteI = ((minuteI = Math.floor(sekunde / 60)) > 9) ? minuteI : "0" + minuteI;
        izpisTimer = minuteI + ":" + sekundeI;
        $("#cas").html(izpisTimer);
    } else {
        sekunde = 0;
        $("#cas").html(izpisTimer);
    }
}

function onKeyDown(evt) {
    if (evt.keyCode == 39) {
        rightDown = true;
    } else if (evt.keyCode == 37) {
        leftDown = true;
    }
}

function onKeyUp(evt) {
    if (evt.keyCode == 39) {
        rightDown = false;
    } else if (evt.keyCode == 37) {
        leftDown = false;
    }
}

function preveriZmago() {
    if (!gameWon && allBricksDestroyed()) {
        gameWon = true;
        clearInterval(timerId);
        clearInterval(intervalId);
        Swal.fire({
            title: 'Congratulations!',
            text: 'You complited level ' + level,
            icon: 'success',
            confirmButtonText: 'OK',
			background: '#111827',
			color: '#5682AA',
			confirmButtonColor: '#5682AA'
        }).then(function () {
			level++;
			gameWon = false;
			updateLevelDisplay();
			resetBall();
			init_paddle();
			initbricks();

			cakaNaStart = true;
			start = false;
			dx = 0;
			dy = 0;

			intervalId = setInterval(draw, 10);
			timerId = setInterval(timer, 1000);
		});
    }
}


function draw() {
    $(document).keydown(onKeyDown);
    $(document).keyup(onKeyUp);
    clear();
	if (bgImage.complete) {
		ctx.drawImage(bgImage, 0, 0, WIDTH, HEIGHT);
	}
    ctx.shadowColor = "#38bdf8";
	ctx.shadowBlur = 30;
	ctx.fillStyle = ballcolor;
	circle(x, y, 10);
	ctx.shadowBlur = 0;

    if (rightDown) {
        if ((paddlex + paddlew) < WIDTH) {
            paddlex += 5;
        } else {
            paddlex = WIDTH - paddlew;
        }
    } else if (leftDown) {
        if (paddlex > 0) {
            paddlex -= 5;
        } else {
            paddlex = 0;
        }
    }

    if (paddleImage.complete) {
		ctx.drawImage(paddleImage, paddlex, HEIGHT - paddleh, paddlew, paddleh);
	} else {
		ctx.fillStyle = paddlecolor;
		rect(paddlex, HEIGHT - paddleh, paddlew, paddleh);
	}

    for (var i = 0; i < NROWS; i++) {
        for (var j = 0; j < NCOLS; j++) {
            if (bricks[i][j] > 0) {
				ctx.fillStyle = brickcolors[bricks[i][j]];

				if (bricks[i][j] == 3) {
					ctx.shadowColor = "#a6d4fc";
					ctx.shadowBlur = 18;
				} else if (bricks[i][j] == 2) {
					ctx.shadowColor = "#90b2ce";
					ctx.shadowBlur = 18;
				} else {
					ctx.shadowColor = "#7b96aa";
					ctx.shadowBlur = 18;
				}

				rect(
					(j * (BRICKWIDTH + PADDING)) + PADDING,
					(i * (BRICKHEIGHT + PADDING)) + PADDING,
					BRICKWIDTH,
					BRICKHEIGHT
				);

				ctx.shadowBlur = 0;
			}
        }
    }
	if (cakaNaStart) {
		return;
	}

    var rowheight = BRICKHEIGHT + PADDING + f / 2;
    var colwidth = BRICKWIDTH + PADDING + f / 2;
    var row = Math.floor(y / rowheight);
    var col = Math.floor(x / colwidth);

    if (y < NROWS * rowheight && row >= 0 && col >= 0 && col < NCOLS && bricks[row][col] > 0) {
        dy = -dy;
        bricks[row][col]--;
        tocke++;
        $("#tocke").html(tocke);
        preveriZmago();
    }

    if (x + dx > WIDTH - r || x + dx < 0 + r) {
        dx = -dx;
    }

	
    if (y + dy < 0 + r) {
        dy = -dy;
    } else if (y + dy > HEIGHT - (r + f)) {
        start = false;
        if (x > paddlex && x < paddlex + paddlew) {
            dx = 8 * ((x - (paddlex + paddlew / 2)) / paddlew);
            dy = -dy;
            start = true;
        } else if (y + dy > HEIGHT - r) {
            clearInterval(timerId);
            clearInterval(intervalId);
			$("#resetBtn").show();
        }
    }

    x += dx;
    y += dy;


}
