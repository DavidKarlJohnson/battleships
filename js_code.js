// Sound effects
var explosion_sound_effect = new Audio('audio/explosion.mp3');
var sonar_sound_effect = new Audio('audio/sonar.mp3');
var sonar2_sound_effect = new Audio('audio/sonar_2.mp3');
var horn_sound_effect = new Audio('audio/horn.mp3');
var ambient_music = new Audio('audio/ambient_music.mp3');
horn_sound_effect.volume = 0.02;
ambient_music.volume = 0.25;
// Indicators of how many hits are left 
// until a ship is fully destroyed
var player_destroyer = {
    title: "player_destroyer",
    hp: 2
};
var player_cruiser = {
    title: "player_cruiser",
    hp: 3
};
var player_submarine = {
    title: "player_submarine",
    hp: 3
};
var player_battleship = {
    title: "player_battleship",
    hp: 4
};
var player_carrier = {
    title: "player_carrier",
    hp: 5
};
var opponent_destroyer = {
    title: "opponent_destroyer",
    hp: 2
};
var opponent_cruiser = {
    title: "opponent_cruiser",
    hp: 3
};
var opponent_submarine = {
    title: "opponent_submarine",
    hp: 3
};
var opponent_battleship = {
    title: "opponent_battleship",
    hp: 4
};
var opponent_carrier = {
    title: "opponent_carrier",
    hp: 5
};
var player_board = [[false, false, player_destroyer, false, false, false, player_cruiser, player_cruiser, player_cruiser, false],
    [false, false, player_destroyer, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false, false, false],
    [player_carrier, false, false, false, false, player_submarine, player_submarine, player_submarine, false, false],
    [player_carrier, false, false, false, false, false, false, false, false, false],
    [player_carrier, false, false, false, false, false, false, false, false, false],
    [player_carrier, false, false, false, false, false, false, false, false, false],
    [player_carrier, false, player_battleship, player_battleship, player_battleship, player_battleship, false, false, false, false]];
var opponent_board = [[false, false, false, false, false, false, false, false, false, opponent_battleship],
    [false, false, false, false, false, false, false, false, false, opponent_battleship],
    [opponent_destroyer, false, false, false, false, false, false, false, false, opponent_battleship],
    [opponent_destroyer, false, false, false, false, false, opponent_submarine, false, false, opponent_battleship],
    [false, false, false, false, false, false, opponent_submarine, false, false, false],
    [false, false, false, false, false, false, opponent_submarine, false, false, false],
    [false, opponent_cruiser, opponent_cruiser, opponent_cruiser, false, false, false, false, false, false],
    [false, false, false, false, opponent_carrier, opponent_carrier, opponent_carrier, opponent_carrier, opponent_carrier, false],
    [false, false, false, false, false, false, false, false, false, false]];
// Set all player buttons green if a ship is found in the array
for (var row = 0; row < player_board.length; row += 1) {
    for (var column = 0; column < player_board[0].length; column += 1) {
        var button = document.getElementById("player_".concat(row).concat(column));
        if (player_board[row][column] !== false && button !== null) {
            button.style.backgroundColor = 'green';
        }
        else { }
    }
}
/**
* Player attacks a grid. If a ship is hit a sound effect is played,
* color of grid button is changed, underlying array element is changed to false.
* The board is locked for 1-3 seconds after the function is called.
* @example fire_at_grid("opponent_21", opponent_board)
* // Fire at grid B3 on the opponents board
* @param {string} button_id - the HTML id of the grid to fire at
* @param {Board} board - the board to target
*/
function fire_at_grid(button_id, board) {
    ambient_music.play();
    var button = document.getElementById(button_id); // ID of current button
    var row = parseInt(button_id.substr(-2, 1)); // Row to fire at
    var column = parseInt(button_id.substr(-1)); // Column to fire at
    var selected_grid = board[row][column];
    if (selected_grid !== false && selected_grid !== true && button !== null) { // Hit
        sonar_sound_effect.play();
        remove_ship(selected_grid);
        board[row][column] = false;
        button.style.backgroundColor = 'red'; // Change button color
    }
    lock_board(); // Lock the board during the AIs turn
    setTimeout(ai_fire_at_player, Math.floor(Math.random() * 2000) + 1000); // 1-3s delay until AI fires
}
/**
* Function targets a random grid on the players board for the AI to shoot at
* AI won't target the same grid twice.
* AI will remember direct hits on grids and will shoot adjacent tiles until ship is sunk
* Locks player interactivity while the AI plays
*/
var ai_memory = [];
function ai_fire_at_player() {
    var random_row = Math.floor(Math.random() * (player_board[0].length - 1)) + 0; // Generate a random number between 0 - max size of a row on the game board
    var random_column = Math.floor(Math.random() * (player_board.length + 1)) + 0; // Generate a random number between 0 - max size of a column on the game board
    var button = document.getElementById("player_".concat(random_row).concat(random_column)); // ID of current button     
    var current_grid = player_board[random_row][random_column];
    if (ai_memory[0] !== undefined) { // Shoot at tiles stored in memory, if they exist
        random_row = ai_memory[0][0];
        random_column = ai_memory[0][1];
        ai_memory.shift();
    }
    else { }
    if (button !== null) {
        if (current_grid === true) { // If the tile is true it means that the AI has already probed that spot. If so, the function will run again until a new tile is found
            return ai_fire_at_player();
        }
        else if (current_grid === false) { // 
            button.style.backgroundColor = 'gray';
            button.style.animation;
        }
        else { // Hit
            sonar2_sound_effect.play();
            ai_memory_store(random_row, random_column); // Store adjacent tiles in memory
            remove_ship(current_grid);
            button.style.backgroundColor = 'red';
        }
    }
    else { }
    player_board[random_row][random_column] = true;
    unlock_board(); // Unlocks interactivity for the player again
}
/**
* Function deducts points from a ship type, either from the player or the opponent.
* If a ship is fully sunk, its icon is removed and a sound effect is played.
* AI memory is cleared if a player ship is fully sunk
* Win condition is called each time to check if all ships are sunk.
* @ param {Ship} ship_type - ship type to deduct points from
* @precondition the ship is a valid ship
*/
function remove_ship(ship_type) {
    ship_type.hp -= 1; // Deduct ship HP
    var ship_paragraph = document.getElementById("".concat(ship_type.title, "_hp"));
    var ship_icon = document.getElementById("".concat(ship_type.title, "_icon"));
    if (ship_type.title.slice(0, 6) === 'player' && ship_paragraph !== null) { // If player ship
        ship_paragraph.textContent = ship_type.hp.toString(); // Update ship HP indicator
        ship_paragraph.style.color = 'red';
        if (ship_type.hp === 0) {
            ai_memory.length = 0; // Clear AI memory
            setTimeout(ship_paragraph.style.opacity = '0', 1000); // Fade out ships HP indicator if 0
        }
        else { }
    }
    else { }
    if (ship_type.hp <= 0 && ship_icon !== null) { // For all ships
        explosion_sound_effect.play();
        ship_icon.src = 'images/blank.png'; // Change ship icon to a blank one if HP 0
    }
    else { }
    check_win_condition(); // Check if a player has no ships left
}
/**
* Checks if the player or the opponent has any ships left.
* If no ships are remaining for either player a pop-up is
* presented
*/
function check_win_condition() {
    if (opponent_destroyer.hp <= 0 &&
        opponent_cruiser.hp <= 0 &&
        opponent_submarine.hp <= 0 &&
        opponent_battleship.hp <= 0 &&
        opponent_carrier.hp <= 0) {
        alert("You win!");
    }
    else if (player_destroyer.hp <= 0 &&
        player_cruiser.hp <= 0 &&
        player_submarine.hp <= 0 &&
        player_battleship.hp <= 0 &&
        player_carrier.hp <= 0) {
        alert("Opponent wins!");
    }
}
var get_arrow_icon = document.querySelector('.arrow_icon');
var get_opponent_board = document.getElementById('opponent_board');
var get_player_title = document.querySelector('.player_title');
var get_opponent_title = document.querySelector('.opponent_title');
/**
* Locks the opponents board, making the buttons unclickabe
* Visual indicators are changed, showing that it's the opponents turn
*/
function lock_board() {
    if (get_opponent_board && get_player_title && get_opponent_title && get_arrow_icon) {
        get_opponent_board.style.pointerEvents = 'none';
        get_player_title.textContent = 'Player';
        get_opponent_title.textContent = 'Opponent*';
        document.body.style.cursor = 'not-allowed'; // Changes the cursor while waiting
        get_arrow_icon.style.transform = 'rotate(180deg)';
    }
    else { }
}
/**
* Unlocks the opponents board, making it clickable again
* Visual indicators are changed, showing that it's the players turn
*/
function unlock_board() {
    if (get_opponent_board && get_player_title && get_opponent_title && get_arrow_icon) {
        get_opponent_board.style.pointerEvents = 'auto';
        get_player_title.textContent = 'Player*';
        get_opponent_title.textContent = 'Opponent';
        document.body.style.cursor = 'pointer'; // Default cursor
        get_arrow_icon.style.transform = 'rotate(360deg)';
    }
    else { }
}
/**
* Stores tiles adjacent of a tile inside the AIs memory
* @example ai_memory_store(1, 1)
* // stores the tiles B1, A2, B3, and C2 in AI memory
* @param {number} row - the row coordinate of the tile
* @param {number} column - the column coordinate of the tile
* @precondition both parameters are within the boundary of the board
*/
function ai_memory_store(row, column) {
    var over = [row - 1, column];
    var under = [row + 1, column];
    var left = [row, column - 1];
    var right = [row, column + 1];
    if (over[0] >= 0 && over[0] <= 8) {
        ai_memory.push(over);
    }
    if (under[0] >= 0 && under[0] <= 8) {
        ai_memory.push(under);
    }
    if (left[1] >= 0 && left[1] <= 9) {
        ai_memory.push(left);
    }
    if (right[1] >= 0 && right[1] <= 9) {
        ai_memory.push(right);
    }
}
