//*** 2048 GAME REPLICA - BY BAO HO ***
//*** DECEMBER, 2020 - LUND, SWEDEN ***

// DEFINE AND INITIALIZE GLOBAL VARIABLES

var gridElement = document.getElementById("game");
var gridNodeElements = [];

var nodes = [];
var gameStatus = {
    score: 0,
    highestTile: 2,
    alreadyWon: false,
    gamePause: false,
    slided: false,
    sound: true,
    darkMode: false,
    styleIndex: 0,
    winningScore: 2048
};
var swipeSound = new Audio("./Sounds/zapsplat_foley_stick_bendy_whoosh_air_fast_001_12681.mp3");
var mergeSound = new Audio("./Sounds/zapsplat_sport_afl_australia_football_catch_hands_001.mp3");
var styleSheetNames = ["./Styles/classic_style.css", "./Styles/vintage_style.css"];



// Tile presentations: font sizes, background colors, text colors
var tileFontSizes = [
    "3rem"  , "3rem"  , "3rem"  , "2.5rem",//2, 4, 8, 16
    "2.5rem", "2.5rem", "2.5rem", "2.5rem",//32, 64, 128, 256
    "2.5rem", "2rem"  , "2rem"  , "2rem",//512, 1024, 2048, 4096
    "2rem"];//8192

var mobileTileFontSizes = [
    "1.5rem" , "1.5rem"  , "1.5rem" , "1.25rem",//2, 4, 8, 16
    "1.25rem", "1.25rem" , "1.25rem", "1.25rem",//32, 64, 128, 256
    "1.25rem", "1rem"    , "1rem"   , "1rem",//512, 1024, 2048, 4096
    "1rem"];//8192

var classicBackgroundColors = [
    "#eee4da", "#ece0c8", "#f3b079", "#ed8d53",//2, 4, 8, 16
    "#f57c5f", "#eb5837", "#f4d86b", "#efca63",//32, 64, 128, 256
    "#e6c12b", "#efc642", "#edc501", "#5eda92",//512, 1024, 2048, 4096
    "#24bc67"];//8192
var classicTextColors = [
    "#7b7168", "#766e63", "#fdfbf4", "#fdfaf5",//2, 4, 8, 16
    "#f9fbf9", "#f9f6f2", "#f9f6f2", "#f9f6f2",//32, 64, 128, 256
    "#f9f6f2", "#f9f6f2", "#f9f6f2", "#f9f6f2",//512, 1024, 2048, 4096
    "#f9f6f2"];//8192

var vintageBackgroundColors = [
    "#e4cd9f", "#efa070", "#f58747", "#d56521",//2, 4, 8, 16
    "#bd4b21", "#ae4636", "#9fa987", "#7a9377",//32, 64, 128, 256
    "#727d6f", "#5e7972", "#31544f", "#563838",//512, 1024, 2048, 4096
    "#3f2a1d"];//8192
var vintageTextColors = [
    "#3f3232", "#3f3232", "#3f3232", "#3f3232",//2, 4, 8, 16
    "#fff1e1", "#fff1e1", "#3f3232", "#3f3232",//32, 64, 128, 256
    "#fff1e1", "#fff1e1", "#fff1e1", "#fff1e1",//512, 1024, 2048, 4096
    "#fff1e1"];//8192

var tileBackgroundColors = classicBackgroundColors;
var tileTextColors       = classicTextColors;
if (window.matchMedia("(max-width: 800px)").matches) {
    tileFontSizes = mobileTileFontSizes;
}


// Touch start coordinates
var x0 = null;
var y0 = null;

// INITIALIZE GAME

init();

function init(){
    if (!localStorage.highscore){
        localStorage.highscore = 0;
    } else {
        localStorage.highscore = Math.max(localStorage.highscore, Number(gameStatus.score));
    }
    
    document.getElementById("info-best-score").innerHTML = "Best<br>" + "<b>"+localStorage.highscore+"</b>";
    setTimeout(resetGame, 300);
}

// LISTEN TO INPUTS FROM USERS

document.getElementById("info-game-name").onclick = resetGame;

document.getElementById("menu-volume").onclick = toggleVolume;

document.getElementById("menu-pallet").onclick = toggleStyleSheet;

document.getElementById("menu-dark-mode").onclick = toggleDarkMode;

document.getElementById("overlay-button-continue").onclick = continueGame;
document.getElementById("overlay-button-new-game").onclick = resetGame;

document.addEventListener("keydown", respondToKey);

document.addEventListener("touchstart", readTouchStartPositions);

document.addEventListener("touchend", respondToTouch);

//Prevent mobile screen from moving when swiping
document.addEventListener('touchmove', function(e) {
    e.preventDefault();
}, { passive: false });


window.addEventListener('resize', reDrawTiles);

// RESPOND TO INPUTS FROM USERS

function resetGame(){
    gameStatus.gamePause = false;
    document.getElementById("overlay-game-over").style.display = "none";

    for (let i = 0; i < nodes.length; i++) {     
        if (nodes[i].tile !== null){
            gridElement.removeChild(nodes[i].tile);
        }   
    }

    gridNodeElements = document.getElementsByClassName("game-node");
    for (let i = 0; i < gridNodeElements.length; i++) {
        let node = {
            gridNodeElement: gridNodeElements[i],
            tile: null
        }
        nodes[i] = node;
    }

    generateRandomTile();
    generateRandomTile();
    
    gameStatus = {
        score: 0,
        highestTile: 2,
        winningScore: gameStatus.winningScore,
        alreadyWon: false,
        gamePause: false,
        slided: false,
        sound: gameStatus.sound,
        styleIndex: gameStatus.styleIndex
    };
    document.getElementById("info-score").innerHTML = "Score<br>";
}

function toggleVolume(){
    if (gameStatus.sound === true){
        gameStatus.sound = false;
        document.getElementsByTagName("i")[0].className = "fas fa-volume-mute";
    } else {
        gameStatus.sound = true;
        document.getElementsByTagName("i")[0].className = "fas fa-volume-up";
    }
}

function toggleStyleSheet(){
    gameStatus.styleIndex = (gameStatus.styleIndex+1)%2;
    document.getElementById("local-style-sheet").setAttribute("href", styleSheetNames[gameStatus.styleIndex]);
        
    tileBackgroundColors = (gameStatus.styleIndex === 0)? classicBackgroundColors:vintageBackgroundColors;
    tileTextColors       = (gameStatus.styleIndex === 0)? classicTextColors:vintageTextColors;
    reDrawTiles();    
}

function toggleDarkMode(){
    if (gameStatus.darkMode === false){
        gameStatus.darkMode = true;
        document.getElementById("menu-dark-mode").className = "fas fa-moon";
    } else {
        gameStatus.darkMode = false;
        document.getElementById("menu-dark-mode").className = "fas fa-sun";
    }
    document.body.classList.toggle("dark-mode");
}

function continueGame(){
    gameStatus.gamePause = false;
    document.getElementById("overlay-winning").style.display = "none";
}

function respondToKey(ke)
{
    if (gameStatus.gamePause === true){
        return false;
    }
    
    let direction = null;
    if (ke.keyCode === 37){
        direction = "LEFT";
    } else if (ke.keyCode === 38){
        direction = "UP";
    } else if (ke.keyCode === 39){
        direction = "RIGHT";
    } else if (ke.keyCode === 40){
        direction = "DOWN";
    }

    if (direction !== null){
        slide(direction);
    }

    return true;
}

function readTouchStartPositions(te){
    const touch = te.touches[0];
    x0 = touch.clientX;
    y0 = touch.clientY;    
}

function respondToTouch(te){
    if (gameStatus.gamePause === true){
        return false;
    }
    const touch = te.changedTouches[0];
    
    let deltaX = touch.clientX - x0;
    let deltaY = touch.clientY - y0;
    x0 = null; y0 = null;

    let direction = null;
    //Ignore short swipe
    if (Math.abs(deltaX)<10 && Math.abs(deltaY)<10){
        return false;
    }
    if (Math.abs(deltaX)>Math.abs(deltaY)){ //Swipe left/right
        if (deltaX > 0){
            direction = "RIGHT";
        }
        else {
            direction = "LEFT";
        }        
    } else {                                //Swipe up/down
        if (deltaY > 0){
            direction = "DOWN";
        }
        else {
            direction = "UP";
        } 
    }

    if (direction !== null){
        slide(direction);
    }

    return true;
}

function slide(direction){
    gameStatus.slided = false;

    let offset = (direction === 'RIGHT' || direction === 'DOWN')? -1:1;
    offset    *= (direction === 'UP'    || direction === 'DOWN')?  4:1;

    let borderIndices = {
        'UP': [0, 1, 2, 3],
        'RIGHT': [3, 7, 11, 15],
        'DOWN': [12, 13, 14, 15],
        'LEFT': [0, 4, 8, 12]
    };

    for (let i = 0; i < borderIndices[direction].length; i++) {
        const borderIndex = borderIndices[direction][i];
        
        for (let j = 0; j < 4; j++) {
            const node = nodes[borderIndex + (j*offset)];

            if (node.tile !== null){
                let toNode = null;

                for (let k = j-1; k >= 0; k--) {
                    const foreNode = nodes[borderIndex + (k*offset)];

                    if (foreNode.tile === null){
                        toNode = foreNode;
                    } else if (node.tile.innerHTML === foreNode.tile.innerHTML){ 
                        if (foreNode.tile.dataset.alreadyMerge === "0"){
                            toNode = foreNode;
                        }
                        break;
                    } else {
                        break;
                    }
                }

                if (toNode !== null){
                    moveTile(node, toNode);
                    gameStatus.slided = true;
                }
            }            
        }

        //Reset all 'alreadyMerge' flags in this row/column
        for (let j = 0; j < 4; j++) {
            const node = nodes[borderIndex + (j*offset)];
            if (node.tile !== null){
                node.tile.dataset.alreadyMerge = 0;
            }            
        }
    }

    if (gameStatus.slided === true){
        generateRandomTile();
        if (checkTilesMovable() === false){
            setTimeout (function(){           
                document.getElementById("overlay-game-over").style.display = "block";
                gameStatus.gamePause = true;
            }, 1000);
        }
    }
}

// HANDLE TILES

function reDrawTiles() {       
    for (let i = 0; i < gridNodeElements.length; i++) {
        if (nodes[i].tile !== null){
            //Update positions
            let top                      = nodes[i].gridNodeElement.getBoundingClientRect().top;
            let left                     = nodes[i].gridNodeElement.getBoundingClientRect().left;
            let width  = nodes[i].gridNodeElement.getBoundingClientRect().width;
            let height = nodes[i].gridNodeElement.getBoundingClientRect().height;
            nodes[i].tile.style.top      = `${top}px`;
            nodes[i].tile.style.left     = `${left}px`;
            nodes[i].tile.style.width    = `${width}px`;
            nodes[i].tile.style.height   = `${height}px`;
            nodes[i].tile.style.lineHeight      = `${height}px`;
            //Update colors and background colors
            let exponent = Math.log2(nodes[i].tile.innerHTML);
            nodes[i].tile.style.backgroundColor = tileBackgroundColors[exponent-1];
            nodes[i].tile.style.color           = tileTextColors[exponent-1];
        }
    }
}

function generateRandomTile(){
    let emptyNodeIndices = [];

    for (let i = 0; i < nodes.length; i++){
        if (nodes[i].tile === null){
            emptyNodeIndices.push(i);
        }
    }
    
    if (emptyNodeIndices.length === 0){
        return false;
    }

    const i          = emptyNodeIndices[generateRandomInteger (emptyNodeIndices.length)];
    const tileNumber = (generateRandomInteger(6) === 0)? 4:2; //The new number is usuallly 2, sometimes 4.
    
    nodes[i].tile    = document.createElement("div");
    gridElement.appendChild(nodes[i].tile); 

    nodes[i].tile.innerHTML      = tileNumber;
    nodes[i].tile.dataset.alreadyMerge = 0;
    nodes[i].tile.classList.add("tile"); 
    let top                      = nodes[i].gridNodeElement.getBoundingClientRect().top;
    let left                     = nodes[i].gridNodeElement.getBoundingClientRect().left;
    let width = nodes[i].gridNodeElement.getBoundingClientRect().width;
    let height = nodes[i].gridNodeElement.getBoundingClientRect().height;
    nodes[i].tile.style.top      = `${top}px`;
    nodes[i].tile.style.left     = `${left}px`;
    nodes[i].tile.style.width    = `${width}px`;
    nodes[i].tile.style.height   = `${height}px`;
    nodes[i].tile.style.lineHeight = `${height}px`;
    let newexponent = Math.log2(nodes[i].tile.innerHTML);
    nodes[i].tile.style.backgroundColor  = tileBackgroundColors[newexponent-1];
    nodes[i].tile.style.color            = tileTextColors[newexponent-1]; 
    nodes[i].tile.style.fontSize         = tileFontSizes[Math.log2(nodes[i].tile.innerHTML)-1];
    if(navigator.platform !== "iPhone"){
        nodes[i].tile.animate([
            // keyframes
            { transform: 'scale(0.5, 0.5)' }, 
            { transform: 'scale(1.0, 1.0)' }
        ], { 
            // timing 
            duration: 100,
            iterations: 1
        });
    }    
    return true;
}

function checkTilesMovable(){
    for (let i = 0; i < gridNodeElements.length; i++) {
        if (nodes[i].tile === null){
            return true;
        }        
    }
    for (let i = 0; i < gridNodeElements.length; i++) {
        let x = i % 4;
        let y = i / 4;
        //Check left cell
        if ((x-1) >= 0 && nodes[i-1].tile.innerHTML == nodes[i].tile.innerHTML){
            return true;
        }
        //Check right cell
        if ((x+1) <= 3 && nodes[i+1].tile.innerHTML == nodes[i].tile.innerHTML){
            return true;
        }
        //Check up cell
        if ((y-1) >= 0 && nodes[i-4].tile.innerHTML == nodes[i].tile.innerHTML){
            return true;
        }
        //Check down cell
        if ((y+1) <= 3 && nodes[i+4].tile.innerHTML == nodes[i].tile.innerHTML){
            return true;
        }
    }
    return false;
}

function moveTile(fromNode, toNode){
    if (toNode.tile === null){        
        if (gameStatus.sound){
            swipeSound.play();
        }
        let top = toNode.gridNodeElement.getBoundingClientRect().top;
        let left = toNode.gridNodeElement.getBoundingClientRect().left;
        fromNode.tile.style.top  = `${top}px`;
        fromNode.tile.style.left = `${left}px`;
        toNode.tile              = fromNode.tile;
    } else if (fromNode.tile.innerHTML === toNode.tile.innerHTML){
        if (gameStatus.sound){
            mergeSound.play();
        }
        let top = toNode.gridNodeElement.getBoundingClientRect().top;
        let left = toNode.gridNodeElement.getBoundingClientRect().left;
        fromNode.tile.style.top  = `${top}px`;
        fromNode.tile.style.left = `${left}px`;
        fromNode.tile.style.opacity = '0';
        gridElement.removeChild(fromNode.tile);
        /* setTimeout(() => {
                gridElement.removeChild(fromNode.tile);
        }, 500); */
        toNode.tile.innerHTML = toNode.tile.innerHTML*2;
        toNode.tile.style.backgroundColor = tileBackgroundColors[Math.log2(toNode.tile.innerHTML)-1];
        toNode.tile.style.color = tileTextColors[Math.log2(toNode.tile.innerHTML)-1];
        toNode.tile.style.fontSize = tileFontSizes[Math.log2(toNode.tile.innerHTML)-1];
        toNode.tile.dataset.alreadyMerge = 1;
        gameStatus.score += parseInt(toNode.tile.innerHTML);
        document.getElementById("info-score").innerHTML = "Score<br>" + "<b>"+gameStatus.score+"</b>"; 
        if(navigator.platform !== "iPhone"){
            toNode.tile.animate([
                // keyframes
                { transform: 'scale(1.2, 1.2)' }, 
                { transform: 'scale(1.0, 1.0)' }
              ], { 
                // timing 
                duration: 300,
                iterations: 1
              });
        }   
        gameStatus.highestTile = Math.max(gameStatus.highestTile, toNode.tile.innerHTML);
        if (gameStatus.highestTile == gameStatus.winningScore && gameStatus.alreadyWon == false){            
            document.getElementById("overlay-winning").style.display = "block";
            gameStatus.alreadyWon = true;
            gameStatus.gamePause = true;
        }  
        if (gameStatus.score > localStorage.highscore){
            localStorage.highscore = gameStatus.score; 
            document.getElementById("info-best-score").innerHTML = "Best<br>" + "<b>"+localStorage.highscore+"</b>";
        }
        
    }
    fromNode.tile = null;
}

// PERFORM TRIVIAL TASKS

function generateRandomInteger (max){
    return Math.floor(Math.random()*max);
}