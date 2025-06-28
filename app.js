/*
[CS491 - Assignment 3] Tic-Tac-Toe: Shared Computer
Nicky Victoriano | 29 June 2025
*/
/**
 * All winning combinations.
 * @constant
 * @type {object} - 2D array
 */
const winCombos = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
]

/**
 * Begins (or clears) game, depending on toggler content.
 * @function startGame
 * @return void
 */
function startGame() {
    // Get elements
    var currentTurn = document.getElementById('currentTurn');
    var toggler = document.getElementById('toggler');
    var buttons = document.getElementsByClassName('ttt');

    // Clear game
    if (toggler.textContent == 'Clear') {
        clearBoard(toggler, currentTurn, buttons);
        return;
    }

    // Start game
    for (let button of buttons) {
        button.classList.add('selectable');
    }
    toggler.textContent = 'Clear';
    toggler.classList.replace('start', 'clear');

    // Pick first turn
    var firstTurn = Math.floor(Math.random() * 2); // Random number 0 - 1
    if (firstTurn) {
        toggleSelectable(buttons, true);
        currentTurn.textContent = 'You';
    } else {
        toggleSelectable(buttons, false);
        botTurn(buttons, currentTurn);
    }
}

/**
 * Resets all fields to pre-game state.
 * @function clearBoard
 * @param {button} toggler - This is the start/clear button.
 * @param {HTMLCollection} buttons - This is an array of all game buttons.
 * @return void
 */
function clearBoard(toggler, currentTurn, buttons) {
    toggler.textContent = 'Start';
    toggler.classList.replace('clear', 'start');
    currentTurn.textContent = '';
    for (let button of buttons) {
        button.className = 'ttt';
        button.textContent = '';
    }
}

/**
 * Makes box selectable or unselectable,
 * @function toggleSelectable
 * @param {HTMLCollection} buttons - This is an array of all game buttons.
 * @param {bool} on - This is the on (true) or off (falss) state of selectable.
 * @return void
 */
function toggleSelectable(buttons, on) {
    for (let button of buttons) {
        if (button.textContent == '') {
            if (on) {
                button.classList.add('selectable');
            } else {
                button.className = 'ttt';
            }
        }
    }
}

/**
 * Cchanges the marker on the chosen box.
 * @function markBox
 * @param {HTMLCollection} buttons - This is an array of all game buttons.
 * @param {int} index - This is the index of the selected box.
 * @param {string} marker - This is the marker of the player marking ("X" or "O").
 * @return void
 */
function markBox(buttons, index, marker) {
    buttons[index].textContent = marker;
    buttons[index].classList.remove("selectable");
}

/**
 * User marks a box.
 * @function pickSpot
 * @param {int} index - This is the index of the box clicked by the player.
 * @return void
 */
function pickSpot(index) {
    // Get elements
    var buttons = document.getElementsByClassName('ttt');
    var currentTurn = document.getElementById('currentTurn');

    // Take turn
    var firstTurn = isFirstTurn(buttons);
    if (buttons[index].classList.contains("selectable")) {
        markBox(buttons, index, 'X');
        if (!firstTurn) { // If not the first turn, end game or let the bot play
            toggleSelectable(buttons, false);
            if (!isWin(buttons)) {
                botTurn(buttons, currentTurn);
            }
            else {
                currentTurn.textContent = 'YOU WIN!';
            }
        }
    }
}

/**
 * Makes bot take turn.
 * @function botTurn
 * @param {HTMLCollection} buttons - This is an array of all game buttons.
 * @param {span} currentTurn - This is a text field containing the playing player.
 * @return void
 */
async function botTurn(buttons, currentTurn) {
    currentTurn.textContent = 'Computer';
    if (isFirstTurn(buttons)) { // Make first move
        var firstTurn = Math.floor(Math.random() * 5) * 2; // Random even number 0 - 4
        await delay(.5);
        markBox(buttons, firstTurn, 'O');
    }

    /**
     * Index of best move.
     * @type{int}
     */
    var botMove;
    /**
     * Index of potential move.
     * @type{int}
     */
    var potentialMove = Math.floor(Math.random() * 9); // Random number 0 - 8
    while (!isPlayable(buttons, potentialMove)) {
        potentialMove = Math.floor(Math.random() * 9); // Random number 0 - 8
    }
    botMove = potentialMove; // Update botMove to any playable move
    potentialMove = goodMoves(buttons);
    if (potentialMove !== null) { // Update botMove to any playable okay move
        botMove = potentialMove;
    }
    potentialMove = winningMoves(buttons, 'X');
    if (potentialMove !== null) { // Update botMove to blocking move
        botMove = potentialMove;
    }
    potentialMove = winningMoves(buttons, 'O');
    if (potentialMove !== null) { // Update botMove to winning move
        botMove = potentialMove;
    }

    await delay(.5);
    markBox(buttons, botMove, 'O'); // Make move

    if (!isWin(buttons)) { // Check for win
        toggleSelectable(buttons, true);
        currentTurn.textContent = 'You';
    } else {
        currentTurn.textContent = 'COMPUTER WINS!';
    }
}

/**
 * Checks if the first turn is being taken.
 * @function isFirstTurn
 * @param {HTMLCollection} buttons - This is an array of all game buttons.
 * @return bool - Returns true if no spots are filled.
 */
function isFirstTurn(buttons) {
    for (let button of buttons) {
        if (!button.textContent == '') {
            return false;
        }
    }
    return true;
}

/**
 * Checks if spot can be played in.
 * @function isPlayable
 * @param {HTMLCollection} buttons - This is an array of all game buttons.
 * @param {string} marker - This is the marker of the player marking ("X" or "O").
 * @return bool - Returns true if spot is not filled.
 */
function isPlayable(buttons, index) {
    if (buttons[index].textContent == '') {
        return true;
    }
    return false;
}

/**
 * Checks for potential good move (corners or center)
 * @function goodMoves
 * @param {HTMLCollection} buttons - This is an array of all game buttons.
 * @return int - Returns index of random corner (or null).
 */
function goodMoves(buttons) {
    /**
     * Index of ideal normal moves.
     * @constant
     * @type{int[]}
     */
    const idealSpots = [0, 2, 4, 6, 8]
    /**
     * Index of available ideal normal moves.
     * @type{int[]}
     */
    var potentialSpots = new Array();

    for (var spot of idealSpots) { // Find potential spots.
        if (isPlayable(buttons, spot)) {
            potentialSpots.push(spot)
        }
    }

    if (potentialSpots.length == 0) {
        return null;
    }
    return potentialSpots[Math.floor(Math.random() * potentialSpots.length)]; // Pick random spot
}

/**
 * Checks for winning combinations that are 1 away.
 * @function winningMoves
 * @param {HTMLCollection} buttons - This is an array of all game buttons.
 * @param {string} marker - This is the marker of the player marking ("X" or "O").
 * @return int - Returns index with most wins (or null).
 */
function winningMoves(buttons, marker) {
    /**
     * Indices that can win a game if filled.
     * @type{int[]}
     */
    var winningIndex = new Array();
    /**
     * Amount of times each index can win the game.
     * @type{int[]}
     */
    var amount = new Array();

    for (combo of winCombos) { // Find winning moves
        let x = combo[0];
        let y = combo[1];
        let z = combo[2];
        let index = -1;

        if (buttons[x].textContent === buttons[y].textContent && buttons[x].textContent === marker) { // Missing Z
            index = z;
        } else if (buttons[x].textContent === buttons[z].textContent && buttons[x].textContent === marker) { // Missing Y
            index = y;
        } else if (buttons[y].textContent === buttons[z].textContent && buttons[z].textContent === marker) { // Missing X
            index = x;
        }

        if (winningIndex.includes(index)) {
            let i = winningIndex.indexOf(index);
            amount[i] = amount[i] + 1;
        } else if (index != -1 && isPlayable(buttons, index)) {
            winningIndex.push(index);
            amount.push(1);
        }
    }

    if (winningIndex.length == 0) { // No wins, move on
        return null;
    }
    const max = Math.max(...amount); // Identify index with most wins
    let i = amount.indexOf(max);
    return winningIndex[i];
}

/**
 * Checks if a player has won.
 * @function isWin
 * @param {HTMLCollection} buttons - This is an array of all game buttons.
 * @return bool - Returns true if a winning combination has been played.
 */
function isWin(buttons) {
    let win = false;
    for (const combo of winCombos) {
        let x = combo[0];
        let y = combo[1];
        let z = combo[2];
        if (buttons[x].textContent === buttons[y].textContent && buttons[x].textContent === buttons[z].textContent && buttons[x].textContent != '') {
            toggleSelectable(buttons, false);
            buttons[x].classList.add('red');
            buttons[y].classList.add('red');
            buttons[z].classList.add('red');
            win = true;
        }
    }
    return win;
}

/**
 * Awaitable function for time delay.
 * @function delay
 * @param {number} seconds - This is the time in seconds to wait for.
 * @return bool - Returns true if a winning combination has been played.
 */
function delay(seconds) {
    return new Promise(function (resolve) {
        setTimeout(resolve, seconds * 1000);
    });
}