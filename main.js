import './style.css'

const normal = {
  finisherMove: 0,
  blockMove: 5,
  threeToTwo: 5,
  threeToOne: 0,
  coverTheMiddle: 7,
};

const hard = {
  finisherMove: 0,
  blockMove: 0,
  threeToTwo: 0,
  threeToOne: 0,
  coverTheMiddle: 3,
};

const game = {
    type: 'P1',
    difficult: normal,
    turn: 0,
    dice: 0,
}
const moves = {
  finisherMove: 0,
  blockMove: 0,
  threeToTwo: 0,
  threeToOne: 0,
  coverTheMiddle: 0,
  blindMove: 0,
}

let players = { 
  X: {
    name: 'X',
    key: 1,
    score: 0,
    player: 'Player',
    container: document.getElementById("player-1_container")
  },
  O: {
    name: 'O',
    key: 2,
    score: 0,
    player: 'Computer',
    container: document.getElementById("player-2_container")
  }
}

let isSinglePlayerGame = true; 
let currentPlayer = players.X;  
let nextPlayer = players.O; 
let isTurnProcessing = false; // Turn is processing or not

// GAMEBOARD 
let blockContainer = document.getElementById('game-board'); 
let gameBoard = Array(9).fill(null);
let winConditions = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],  // Horizontal
  [0, 3, 6], [1, 4, 7], [2, 5, 8],  // Vertical
  [0, 4, 8], [2, 4, 6], // Cross
]

// HANDLE NEWGAME BUTTONS
document.getElementById('newgame-button').addEventListener('click', newGame);

// HANDLE DIFFICULT BUTTON
const normalBtn = document.getElementById('normal-mode');
normalBtn.addEventListener('click', () => {
  if (isTurnProcessing === false && game.difficult !== normal) {
    game.difficult = normal;
    hardBtn.classList.add('fade');
    normalBtn.classList.remove('fade');
    newGame();
  } else {
    return
  }
});
const hardBtn = document.getElementById('hard-mode');
hardBtn.addEventListener('click', () => {
  if (isTurnProcessing === false && game.difficult !== hard) {
    game.difficult = hard;
    normalBtn.classList.add('fade');
    hardBtn.classList.remove('fade');
    newGame();
  } else {
    return
  }
});

// HANDLE GAME TYPE BUTTON
document.getElementById('game-type_container').addEventListener('click', () => {  // Oyun türünü değiştir ve yeni oyun başlat
  if (isTurnProcessing === false) {
    isSinglePlayerGame = !isSinglePlayerGame 

    if (isSinglePlayerGame) {
      players.X.player = 'Player'
      players.O.player = 'Computer';
      game.type = 'P1';
    } else {
      players.X.player = 'Player 1';
      players.O.player = 'Player 2';
      game.type = 'P2';
    };
  
    newGame(); 
  } else {
    return
  }
})

function createCell() {
  for (let i = 0; i < gameBoard.length; i++) { 

    const block = document.createElement('div'); 
    const cell = document.createElement('div');
    block.classList.add('block');
    cell.classList.add('cell');

    block.addEventListener('click', () => { 
      if (isTurnProcessing === false && gameBoard[i] === null) {
        turnProcessing(i, cell);

      } else { 
        return
      }
    });

    block.appendChild(cell);
    document.getElementById('game-board').appendChild(block);
  }
}

// ALL TURN PROCESSING
function turnProcessing(i, cell) {
  isTurnProcessing = true;
  playToCell(i, cell);
  
  if (isWinOrDraw() === true) {
    setTimeout(() => {
      resetGame();
      changePlayer();
      turnAnimation();
      if (isSinglePlayerGame && currentPlayer === players.O) {
        isTurnProcessing = true;
      } else {
        isTurnProcessing = false;
      }
    }, 2500);

  } else {
    changePlayer();
    turnAnimation();

    if (isSinglePlayerGame && currentPlayer === players.O) {
      isTurnProcessing = true;
    } else {
      isTurnProcessing = false;
    }
  }
}

function playToCell(i, cell) {
  gameBoard[i] = currentPlayer.key; 
  cell.classList.add(currentPlayer.name);
}

function changePlayer() {
  currentPlayer = currentPlayer === players.X ? players.O : players.X;
  nextPlayer = nextPlayer === players.X ? players.O : players.X;

  if (isSinglePlayerGame && currentPlayer === players.O) {
    setTimeout(() => {
      checkWinConditions();
      computerMove();
    }, 300);
  }
}

function isWinOrDraw() {
  game.turn ++;

  for (let conditions of winConditions) { 
    const [a, b, c] = conditions;
    
    // WIN CHECK
    if (game.turn >= 4 && 
      ([gameBoard[a], gameBoard[b], gameBoard[c]].every(v => v === players.X.key) ||
      [gameBoard[a], gameBoard[b], gameBoard[c]].every(v => v === players.O.key))) {
      
      const win = [a, b, c]; 
  
      winAnimation(win);
      currentPlayer.score++;
      console.log(`----------------------------${currentPlayer.player} kazandı! oyun baştan başlayacak...`);
      
      return true;
    }
  }
  
  // DRAW CHECK
  if (game.turn >= 9 && !winAnimation.isPlaying) { 
    drawAnimation();
    console.log('----------------------------Berabere bitti! Oyun baştan başlayacak...');
    
    return true;
  }
}

// TURN PROCESSING ANIMATIONS
function winAnimation(win) {
  const unClickable = 3;
  let cell;

  for (let i = 0; i < gameBoard.length; i++) {
    cell = blockContainer.childNodes[i].childNodes[0];

    if (win.includes(i)) {
      cell.classList.add('win');

    } else {
      if (gameBoard[i] === null) {
        gameBoard[i] = unClickable;
      }

      cell.classList.add('fade');
    }
  }
}

function drawAnimation() {
  let cell;

  for (let i = 0; i < gameBoard.length; i++) {
    cell = blockContainer.childNodes[i].childNodes[0]; 
    cell.classList.add('fade');
  }
}

function turnAnimation() {
  nextPlayer.container.classList.add('fade');
  currentPlayer.container.classList.remove('fade');
}

// CHECK WIN CONDITIONS For Computer
function checkWinConditions() {
  const conditionsArr = [];

  for (let i = 0; i < winConditions.length; i++) { 
    const [a, b, c] = winConditions[i]; 
    const conditions = [gameBoard[a], gameBoard[b], gameBoard[c]];
    conditionsArr.push({ conditions, index: i })
  }

  // Possible Block Moves
  moves.blockMove = conditionsArr.filter(v => 
    v.conditions.filter(val => val === players.X.key).length === 2 && 
    v.conditions.includes(null) 
  ).map(v => ({
    index: v.index,
    conditions: v.conditions
  }));

  // Possible Random Finisher Moves
  moves.finisherMove = conditionsArr.filter(v => 
    v.conditions.filter(val => val === players.O.key).length === 2 && 
    v.conditions.includes(null)
  ).map(v => ({
    index: v.index,
    conditions: v.conditions
  }));

  // Possible Random 3/2 Moves
  moves.threeToTwo = conditionsArr.filter(v =>
    v.conditions.filter(val => val === players.O.key).length === 1 &&
    v.conditions.filter(val => val === null).length === 2
  ).map(v => ({
    index: v.index,
    conditions: v.conditions
  }));

  // Possible Random 3/1 Moves
  moves.threeToOne = conditionsArr.filter(v =>
    v.conditions.filter(vol => vol === null).length === 3
  ).map(v => ({
    index: v.index,
    conditions: v.conditions
  }));

  // Possible Middle Move in 3/1 Moves
  const middleMoves = [1, 4, 6, 7]
  moves.coverTheMiddle = moves.threeToOne.filter(v => (
    middleMoves.includes(v.index)) &&
    v.conditions[1] === null);

  // Possible Random Blind Move
  moves.blindMove = conditionsArr.filter(v =>
    v.conditions.filter(vol => vol === null).length === 1
  ).map(v => ({
    index: v.index,
    conditions: v.conditions
  }));
}
// COMPUTER
function computerMove() {
  rollTheDice();
  const playableMoves = selectMove();
  playMove(playableMoves);
}

function rollTheDice() {
  game.dice = Math.floor(Math.random() * 20) + 1;
  console.log(`dice: ${game.dice}`);

  return game.dice;
}

function selectMove () {
  let playableMoves = null;

  // Play Finisher Move 
  if (moves.finisherMove.length > 0 && game.dice > game.difficult.finisherMove){
    playableMoves = moves.finisherMove;
    console.log('finisher move');

  } // Play Block Move 
    else if (moves.blockMove.length > 0 && game.dice > game.difficult.blockMove) {
      playableMoves = moves.blockMove;
      console.log('block move');

    } // Play 3/2 Move 
      else if (moves.threeToTwo.length > 0 && game.dice > game.difficult.threeToTwo) {
        playableMoves = moves.threeToTwo;
        console.log('3/2 move');

      }  // Play 3/1 Move && Play Middle Move in 3/1 Move
        else if (moves.threeToOne.length > 0) {
          if (game.dice > game.difficult.coverTheMiddle &&
            moves.coverTheMiddle.length > 0
          ) { 
              playableMoves = 4
              console.log('3/1 middle move');

          } else {
              playableMoves = moves.threeToOne;
              console.log(' 3/1 move');
          }
        } //  Play Blind Move 
          else if (moves.blindMove.length > 0) {
            playableMoves = moves.blindMove;
            console.log('blind move');
          }

  return playableMoves;
};

function playMove (playableMoves) {
  console.log(playableMoves);

  let i;
  // If the move is not coverMiddle
  if (playableMoves !== 4) {
    const randomIndex = Math.floor(Math.random() * playableMoves.length);
    const selectedMove = playableMoves[randomIndex];
    const emptyCellsIndex = [];  

    for (let i = 0; i < selectedMove.conditions.length; i++) {
      if (selectedMove.conditions[i] === null) {
        emptyCellsIndex.push(i);
      }
    }
    const selectedMoveIndex = []; 

    if (emptyCellsIndex.length > 0) {
      const selectedIndex = emptyCellsIndex[Math.floor(Math.random() * emptyCellsIndex.length)];
      selectedMoveIndex.push(selectedIndex);
    }

    const callBackMove = winConditions[selectedMove.index] 
    i = callBackMove[selectedMoveIndex];
  
  } else {
    i = 4;
  }
  // hücreye oyna
  const cell = blockContainer.children[i].childNodes[0];
  turnProcessing(i, cell);
}

// NEW GAME && RESET GAME
function resetGame () {
  gameBoard.fill(null);  
  blockContainer.innerHTML = '';

  document.getElementById('player-1_name').innerText = players.X.player + ' (X)';
  document.getElementById('player-1_score').innerText = players.X.score;
  document.getElementById('player-2_name').innerText = players.O.player + ' (O)';
  document.getElementById('player-2_score').innerText = players.O.score;
  document.getElementById('game-type-num').classList.remove('P1', 'P2');
  document.getElementById('game-type-num').classList.add(game.type);

  game.turn = 0;
  createCell(); 
}

function newGame () { 
  if (isTurnProcessing === false) {
    players.X.score = 0; 
    players.O.score = 0;
    currentPlayer = players.X;
    nextPlayer = players.O;
    turnAnimation(); 
    resetGame(); 
  }
}

newGame(); 