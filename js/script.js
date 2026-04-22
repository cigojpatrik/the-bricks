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
var ballcolor = "#ff2a00";
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

var paused = false;
var gameOver = false;

var bgImage = new Image();
bgImage.src = "img/background.png";

var paddleImage = new Image();
paddleImage.src = "img/paddle.png";

function updateLevelDisplay() {
    $("#level").html(level);
}

function getBestScore() {
    var best = localStorage.getItem("galaxyBricksBest");
    return best ? parseInt(best) : 0;
}

function setBestScore(score) {
    localStorage.setItem("galaxyBricksBest", score);
    $("#bestScore").html(score);
}

function checkBestScore() {
    if (tocke > getBestScore()) {
        setBestScore(tocke);
    }
}

function showInstructions() {
    Swal.fire({
        title: 'Instructions',
        html: '<div style="text-align:left;">' +
              '<p><b>Goal:</b> Destroy all the bricks on the screen to complete each level.</p><br>' +
              '<p><b>Controls:</b></p>' +
              '<ul style="margin-left:20px;">' +
              '<li>Use the <b>Left Arrow (\u2190)</b> and <b>Right Arrow (\u2192)</b> keys to move the paddle.</li>' +
              '<li>Click <b>Start</b> to launch the ball.</li>' +
              '<li>Click <b>Pause</b> to pause or continue the game.</li>' +
              '<li>Click <b>Reset</b> to restart the game from level 1.</li>' +
              '</ul><br>' +
              '<p><b>Scoring:</b> You earn 1 point for each brick you destroy. Your best score is saved automatically.</p><br>' +
              '<p><b>Tip:</b> Don\'t let the ball fall below the paddle, or the game ends!</p>' +
              '</div>',
        icon: 'info',
        confirmButtonText: 'Got it!',
        background: '#111827',
        color: '#5682AA',
        confirmButtonColor: '#5682AA',
        width: 600
    });
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
function togglePause() {
    if (cakaNaStart || gameOver) {
        return;
    }

    if (!paused) {
        paused = true;
        clearInterval(intervalId);
        clearInterval(timerId);
        $("#pauseBtn").html("Continue");
    } else {
        paused = false;
        intervalId = setInterval(draw, 10);
        timerId = setInterval(timer, 1000);
        $("#pauseBtn").html("Pause");
    }
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
    $("#bestScore").html(getBestScore());
	
	cakaNaStart = true;
	start = false;
	dx = 0;
	dy = 0;
	
    intervalId = setInterval(draw, 10);
    timerId = setInterval(timer, 1000);
	paused = false;
	gameOver = false;
	$("#pauseBtn").html("Pause");
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

function Zmaga() {
    if (!gameWon && allBricksDestroyed()) {
        gameWon = true;
        clearInterval(timerId);
        clearInterval(intervalId);
        checkBestScore();
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
    ctx.shadowColor = "#ff4500";
	ctx.shadowBlur = 35;
	var fireGradient = ctx.createRadialGradient(x, y, 0, x, y, 10);
	fireGradient.addColorStop(0, "#fff2a8");
	fireGradient.addColorStop(0.4, "#ff8c00");
	fireGradient.addColorStop(1, "#cc0000");
	ctx.fillStyle = fireGradient;
	circle(x, y, 10);
	ctx.shadowBlur = 0;

    if (rightDown) {
        if ((paddlex + paddlew) < WIDTH) {
            paddlex += 8;
        } else {
            paddlex = WIDTH - paddlew;
        }
    } else if (leftDown) {
        if (paddlex > 0) {
            paddlex -= 8;
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
        Zmaga();
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
			gameOver = true;
            clearInterval(timerId);
            clearInterval(intervalId);
            checkBestScore();
			$("#resetBtn").show();
        }
    }

    x += dx;
    y += dy;


}
