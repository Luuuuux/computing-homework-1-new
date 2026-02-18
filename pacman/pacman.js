const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const TILE_SIZE = 25;
const ROWS = 15;
const COLS = 19;

canvas.width = COLS * TILE_SIZE;
canvas.height = ROWS * TILE_SIZE;

/*
0 = empty
1 = wall
2 = pellet
*/
const map = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,2,1,1,2,1,2,1,1,2,1,1,2,1,2,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,2,1],
    [1,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,2,1],
    [1,1,1,1,2,1,1,2,1,2,1,1,2,1,1,1,1,2,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,2,1,1,2,1,2,1,1,2,1,1,2,1,2,1],
    [1,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,2,1],
    [1,1,1,1,2,1,1,2,1,2,1,1,2,1,1,1,1,2,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,2,1,1,2,1,2,1,1,2,1,1,2,1,2,1],
    [1,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,2,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

// ============================
// Player
// ============================

const player = {
    row: 1,
    col: 1,
    direction: "right",
    nextDirection: "right"
};

const ghost = {
    row: 7,
    col: 9
};

let score = 0;
let lives = 3;
let gameOver = false;

// ============================
// Rose Power
// ============================

let rose = null;
let powerMode = false;
let powerTimer = 0;

// ============================
// Hearts
// ============================

let hearts = [];
let heartCooldown = 0;

// ============================
// Input
// ============================

document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp") player.nextDirection = "up";
    if (e.key === "ArrowDown") player.nextDirection = "down";
    if (e.key === "ArrowLeft") player.nextDirection = "left";
    if (e.key === "ArrowRight") player.nextDirection = "right";
});

// ============================
// Helpers
// ============================

function canMove(row, col) {
    return map[row][col] !== 1;
}

function eatPellet() {
    if (map[player.row][player.col] === 2) {
        map[player.row][player.col] = 0;
        score += 10;
    }
}

function spawnRose() {
    if (!rose && Math.random() < 0.002) {
        let r, c;
        do {
            r = Math.floor(Math.random() * ROWS);
            c = Math.floor(Math.random() * COLS);
        } while (map[r][c] !== 0);
        rose = { row: r, col: c };
    }
}

function eatRose() {
    if (rose && player.row === rose.row && player.col === rose.col) {
        powerMode = true;
        powerTimer = 300; // frames
        rose = null;
    }
}

function checkCollision() {
    if (player.row === ghost.row && player.col === ghost.col) {
        if (powerMode) {
            ghost.row = 7;
            ghost.col = 9;
            score += 100;
        } else {
            lives--;
            player.row = 1;
            player.col = 1;
            if (lives <= 0) gameOver = true;
        }
    }
}

// ============================
// Movement
// ============================

function movePlayer() {

    let targetRow = player.row;
    let targetCol = player.col;

    if (player.nextDirection === "up") targetRow--;
    if (player.nextDirection === "down") targetRow++;
    if (player.nextDirection === "left") targetCol--;
    if (player.nextDirection === "right") targetCol++;

    if (canMove(targetRow, targetCol)) {
        player.direction = player.nextDirection;
    }

    targetRow = player.row;
    targetCol = player.col;

    if (player.direction === "up") targetRow--;
    if (player.direction === "down") targetRow++;
    if (player.direction === "left") targetCol--;
    if (player.direction === "right") targetCol++;

    if (canMove(targetRow, targetCol)) {
        player.row = targetRow;
        player.col = targetCol;
    }

    eatPellet();
    eatRose();
}

function moveGhost() {
    const dirs = ["up","down","left","right"];
    const dir = dirs[Math.floor(Math.random()*4)];

    let r = ghost.row;
    let c = ghost.col;

    if (dir === "up") r--;
    if (dir === "down") r++;
    if (dir === "left") c--;
    if (dir === "right") c++;

    if (canMove(r,c)) {
        ghost.row = r;
        ghost.col = c;
    }
}

// ============================
// Hearts
// ============================

function shootHeart() {
    hearts.push({
        row: player.row,
        col: player.col,
        direction: player.direction
    });
}

function updateHearts() {
    hearts.forEach(h => {
        if (h.direction === "up") h.row--;
        if (h.direction === "down") h.row++;
        if (h.direction === "left") h.col--;
        if (h.direction === "right") h.col++;

        if (!canMove(h.row,h.col)) h.dead = true;

        if (h.row === ghost.row && h.col === ghost.col) {
            ghost.row = 7;
            ghost.col = 9;
            score += 100;
            h.dead = true;
        }
    });

    hearts = hearts.filter(h => !h.dead);
}

// ============================
// Draw
// ============================

function drawMap() {
    for (let r=0;r<ROWS;r++){
        for (let c=0;c<COLS;c++){
            if (map[r][c]===1){
                ctx.fillStyle="blue";
                ctx.fillRect(c*TILE_SIZE,r*TILE_SIZE,TILE_SIZE,TILE_SIZE);
            } else if (map[r][c]===2){
                ctx.fillStyle="white";
                ctx.beginPath();
                ctx.arc(c*TILE_SIZE+TILE_SIZE/2,r*TILE_SIZE+TILE_SIZE/2,3,0,Math.PI*2);
                ctx.fill();
            }
        }
    }
}

function drawPlayer() {
    ctx.fillStyle = powerMode ? "hotpink" : "yellow";
    ctx.beginPath();
    ctx.arc(player.col*TILE_SIZE+TILE_SIZE/2,
            player.row*TILE_SIZE+TILE_SIZE/2,
            TILE_SIZE/2-2,0,Math.PI*2);
    ctx.fill();
}

function drawGhost() {
    ctx.fillStyle="red";
    ctx.beginPath();
    ctx.arc(ghost.col*TILE_SIZE+TILE_SIZE/2,
            ghost.row*TILE_SIZE+TILE_SIZE/2,
            TILE_SIZE/2-2,0,Math.PI*2);
    ctx.fill();
}

function drawRose(){
    if(rose){
        ctx.fillStyle="pink";
        ctx.beginPath();
        ctx.arc(rose.col*TILE_SIZE+TILE_SIZE/2,
                rose.row*TILE_SIZE+TILE_SIZE/2,
                8,0,Math.PI*2);
        ctx.fill();
    }
}

function drawHearts(){
    ctx.fillStyle="hotpink";
    hearts.forEach(h=>{
        ctx.beginPath();
        ctx.arc(h.col*TILE_SIZE+TILE_SIZE/2,
                h.row*TILE_SIZE+TILE_SIZE/2,
                6,0,Math.PI*2);
        ctx.fill();
    });
}

function drawUI(){
    ctx.fillStyle="white";
    ctx.font="18px Arial";
    ctx.fillText("Score: "+score,10,20);
    ctx.fillText("Lives: "+lives,10,40);
    if(gameOver){
        ctx.font="40px Arial";
        ctx.fillText("GAME OVER",canvas.width/2-120,canvas.height/2);
    }
}

// ============================
// Game Loop
// ============================

let frameCount=0;

function gameLoop(){
    ctx.clearRect(0,0,canvas.width,canvas.height);

    if(!gameOver){
        frameCount++;

        if(frameCount%10===0){
            movePlayer();
            moveGhost();
            checkCollision();
        }

        spawnRose();

        if(powerMode){
            powerTimer--;
            heartCooldown++;
            if(heartCooldown%20===0){
                shootHeart();
            }
            if(powerTimer<=0){
                powerMode=false;
                heartCooldown=0;
            }
        }

        updateHearts();
    }

    drawMap();
    drawRose();
    drawPlayer();
    drawGhost();
    drawHearts();
    drawUI();

    requestAnimationFrame(gameLoop);
}

gameLoop();
