/*
[CS491 - Assignment 3] Tic-Tac-Toe: Shared Computer
Nicky Victoriano | 29 June 2025
*/

// #region Global Variables
/**
 * True: this player is X.
 * @type {bool}
 */
var iAmX;

/**
 * All winning combinations.
 * @constant
 * @type {object} - 2D array
 */
const winCombos = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
];

/**
 * Current turn section in DOM.
 * @type {span}
 */
var currentTurn;

/**
 * Player's marker section in DOM.
 * @type {span}
 */
var turnIcon;

/**
 * Current gameplay file name in DOM.
 * @type {span}
 */
var fileName;

/**
 * Clear/start button of DOM.
 * @type {button}
 */
var toggler;

/**
 * Collection of 9 gameplay buttons in DOM.
 * @type {HTMLCollection}
 */
var buttons;

/**
 * Container for dice input in DOM.
 * @type {div}
 */
var diceContainer;

/**
 * @typedef GameState
 * @type {object}
 * @property {string} status - Game status ("player-select", "playing", "win", "draw").
 * @property {string[]} board - 9x9 grid of played moves.
 * @property {?string} currentTurn - Current turn ("X", "O", "").
 * @property {?string} firstTurn - First player to go in game ("X", "O", null).
 * @property {?int} diceRoll - Random number 1 - 6 (null when not in use).
 * @property {?int} xDiceGuess - Player X's guess for dice roll (null when not in use).
 * @property {?int} oDiceGuess - Player O's guess for dice roll (null when not in use).
 * @property {int[]} winningIndexes - Winning indexes found during `isWin()`.
 */

/**
 * Object containing up-to-date game information.
 * @type {GameState}
 */
var currentGameState = {
        status: 'player-select',
        board: ['', '', '', 
                '', '', '',
                '', '', '',],
        currentTurn: '',
        firstTurn: null,
        diceRoll: null,
        xDiceGuess: null,
        oDiceGuess: null,
        winningIndexes: [],
    }

/**
 * Current file in used for game.
 * @type {File}
 */
var fileHandle;

// #region File Management
/**
 * Create game state file in file manager.
 * @function createGameStateFile
 */
async function createGameStateFile(){
    const options = {
        startIn: 'documents',
        suggestedName: 'Tic-Tac-Toe-Game-State.json',
        types: [
            {
                description: 'Tic-Tac-Toe: Shared Computer (Game State)',
                accept: {'text/plain': ['.json'],},
            },
        ],
    };
    fileHandle = await window.showSaveFilePicker(options);
    
    // join game
    iAmX = true;
    await getElements();
    await clearGameState();
    updateGameVisuals();
}

/**
 * Join game state file from file manager.
 * @function joinGameStateFile
 */
async function joinGameStateFile(){
    const fileHandles = await self.showOpenFilePicker({startIn: 'documents'});
    // If only one file is expected, you can destructure the array:
    [fileHandle] = fileHandles;

    // join game
    iAmX = false;
    getElements();
    await readGameState();
}

/**
 * Restart game to player select.
 * @function clearGameState
 */
async function clearGameState(){
    const fileWritable = await fileHandle.createWritable();
    currentGameState = {
        status: 'player-select',
        board: ['', '', '', 
                '', '', '',
                '', '', '',],
        currentTurn: '',
        firstTurn: null,
        diceRoll: null,
        xDiceGuess: null,
        oDiceGuess: null,
        winningIndexes: [],
    }
    let jsonString = JSON.stringify(currentGameState);
    await fileWritable.write(jsonString);
    await fileWritable.close();
}

/**
 * Start game with selected player.
 * @function startGameState
 * @param {string} icon - "X" or "O"
 */
async function startGameState(icon){
    const fileWritable = await fileHandle.createWritable();
    currentGameState = {
        status: 'playing',
        board: ['', '', '', 
                '', '', '',
                '', '', '',],
        currentTurn: icon,
        firstTurn: icon,
        diceRoll: null,
        xDiceGuess: null,
        oDiceGuess: null,
        winningIndexes: [],
    }
    let jsonString = JSON.stringify(currentGameState);
    await fileWritable.write(jsonString);
    await fileWritable.close();
}

/**
 * Update game state file to match latest move and update visuals.
 * @function updateGameState
 */
async function updateGameState(){
    const fileWritable = await fileHandle.createWritable();
    let jsonString = JSON.stringify(currentGameState);
    await fileWritable.write(jsonString);
    await fileWritable.close();

    updateGameVisuals();
}

/**
 * Read in game state file and update visuals.
 * @function readGameState
 */
async function readGameState(){
    const file = await fileHandle.getFile();
    fileContents = await file.text();
    const jsonObject = JSON.parse(fileContents);

    currentGameState.status = jsonObject.status;
    currentGameState.board = jsonObject.board;
    currentGameState.currentTurn = jsonObject.currentTurn;
    currentGameState.firstTurn = jsonObject.firstTurn;
    currentGameState.diceRoll = jsonObject.diceRoll;
    currentGameState.xDiceGuess = jsonObject.xDiceGuess;
    currentGameState.oDiceGuess = jsonObject.oDiceGuess;
    currentGameState.winningIndexes = jsonObject.winningIndexes;

    updateGameVisuals();
}
// #endregion

// #region HTML
/**
 * Read in elements from DOM and add click event listeners.
 * @function getElements
 */
function getElements(){
    currentTurn = document.getElementById('currentTurn');
    turnIcon = document.getElementById('turnIcon');
    fileName = document.getElementById('fileName');
    toggler = document.getElementById('toggler');
    buttons = document.getElementsByClassName('ttt');
    diceContainer = document.getElementById('dice');

    let i = 0;
    for (let button of buttons){
        button.addEventListener('click', () => onBoardClick(i));
        i++;
    }

    toggler.addEventListener('click', () => onToggleClick());
}

/**
 * Update HTML elements to match `currentGameState`.
 * @function updateGameVisuals
 */
function updateGameVisuals(){
    let gameStatus = currentGameState.status;

    // You are:
    turnIcon.textContent = iAmX ? "X" : "O";

    // Current Move:
    currentTurn.textContent = currentGameState.currentTurn;
    if (gameStatus === 'win') {
        let winner = currentGameState.board[currentGameState.winningIndexes[0]];
        currentTurn.textContent = winner + " WON!";
    } else if (gameStatus === 'draw')
        currentTurn.textContent = "Draw! Please guess a number to play again!"

    // Dice guessing game
    diceContainer.style.display = (gameStatus === 'player-select' || gameStatus === 'draw') ? 'block' : 'none';

    // Toggler
    if (gameStatus === 'playing') {
        toggler.textContent = 'Clear';
        toggler.classList.replace('start', 'clear');
    } else {
        toggler.textContent = 'Start';
        toggler.classList.replace('clear', 'start');
    }

    // Board
    let i = 0;
    for (let button of buttons) {
        button.className = 'ttt';
        button.textContent = currentGameState.board[i];
        if (currentGameState.board[i] === '' && isMyTurn())
            button.classList.add('selectable');
        i++;
    }
    if (gameStatus === 'win') {
        for (let index of currentGameState.winningIndexes)
            buttons[index].classList.add('red');
    }
    
    updateFileName();
}

/**
 * Update listed file name in HTML.
 * @function updateFileName
 */
function updateFileName(){
    fileName.textContent = fileHandle.name;
}
// #endregion

// #region Event Handlers
/**
 * Begins (or clears) game, depending on `currentGameState.status`.
 * @function onToggleClick
 * @return {void}
 */
async function onToggleClick() {
    await readGameState();
    let gameStatus = currentGameState.status;

    if (gameStatus === 'player-select'){
        if (currentGameState.xDiceGuess === null || currentGameState.oDiceGuess === null){
            alert("Both players must submit a number to start!");
            return;
        }

        // Decide first player
        currentGameState.diceRoll = Math.floor(Math.random() * 6) + 1;
        let xDifference = Math.abs(currentGameState.diceRoll - currentGameState.xDiceGuess);
        let oDifference =  Math.abs(currentGameState.diceRoll - currentGameState.oDiceGuess);

        if (xDifference == oDifference) {
            alert('Players tied! Resubmit numbers.');
            await clearGameState();
        } else {
            alert('The number was ' + currentGameState.diceRoll +
                '!\nX guessed ' + currentGameState.xDiceGuess +
                '.\nO guessed ' + currentGameState.oDiceGuess + '.');
            (xDifference < oDifference) ? await startGameState('X') : await startGameState('O');
        }

        await updateGameState();
        return;
    }

    if (gameStatus === 'playing' || gameStatus === 'draw'){
        await clearGameState();
        await updateGameState();
        return;
    }

    if (gameStatus === 'win'){
        let winner = currentGameState.board[currentGameState.winningIndexes[0]];
        await startGameState(winner);
        await updateGameState();
        return;
    }
}

/**
 * Register player's dice guess.
 * @function onGuessNumber
 * @return {void}
 */
async function onGuessNumber(){
    await readGameState();
    var textBox = document.getElementById('diceGuess');
    if (isNaN(Number(textBox.value))){
        alert("Please type a number for your guess!");
        return;
    }
    if (iAmX)
        currentGameState.xDiceGuess = Number(textBox.value);
    else
        currentGameState.oDiceGuess = Number(textBox.value);
    await updateGameState();
}

/**
 * Register player move (if valid).
 * @function onBoardClick
 * @param {int} index - This is the index of the box clicked by the player.
 * @return {void}
 */
async function onBoardClick(index) {
    await readGameState();
    console.log(currentGameState.currentTurn + " clicked " + index);

    // Take turn
    if (!isPlayable(index)){
        console.log("Move is not valid");
        return;
    }

    let nextPlayer = iAmX ? "O" : "X";
    currentGameState.board[index] = currentGameState.currentTurn;
    isWin();
    if (currentGameState.status !== 'win') {
        isDraw();
    }
    if (currentGameState.status === 'playing') {
        currentGameState.currentTurn = nextPlayer;
    }
    await updateGameState();
}
// #endregion

// #region Checkers
/**
 * Check if it is player's turn.
 * @function isMyTurn
 * @return {bool}
 */
function isMyTurn(){
    return ((iAmX && currentGameState.currentTurn === 'X') || (!iAmX && currentGameState.currentTurn === 'O'));
}

/**
 * Checks if spot can be played in.
 * @function isPlayable
 * @param {int} index - Index being checked.
 * @return {bool} - Returns true if spot is not filled.
 */
function isPlayable(index) {
    return (currentGameState.board[index] === '' && isMyTurn());
}

/**
 * Checks if a player has won.
 * @function isWin
 * @return {bool} - Returns true if player won.
 */
function isWin() {
    let playerWon = false;
    let winners = new Set();
    let board = currentGameState.board;
    for (const combo of winCombos) {
        let x = combo[0];
        let y = combo[1];
        let z = combo[2];
        if (board[x] === board[y] && board[x] === board[z] && board[x] != '') {
            winners.add(x);
            winners.add(y);
            winners.add(z);
            playerWon = true;
        }
    }
    currentGameState.winningIndexes =  [...winners];
    if (playerWon){
        currentGameState.status = 'win';
        console.log("Player wins!")
    }
    return playerWon;
}

/**
 * Checks if players hit a draw.
 * @function isDraw
 */
function isDraw(){
    let foundDraw = true;
    for (const boardIcon of currentGameState.board) {
        if (boardIcon === '')
            foundDraw = false;
    }
    if (foundDraw){
        currentGameState.status = 'draw';
        console.log("Players have a draw!")
    }
}
// #endregion