import './style.css'
// ZORLUK DÜZEYLERİNDE HAMLELERİN GEREKTİRDİĞİ ZARLAR DEĞİŞTİRİLİR
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
// OYUN
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
// OYUNCULAR
// TODO playersdan game çıkartılacak
// TODO Eğer conditionsta ihtimal yoksa seni blocklayacak hamleyi çıkartamıyor..
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
// DEFAULT 
let isSinglePlayerGame = true;  // Oyun türü = default
let currentPlayer = players.X;  // Oynaması beklenen oyuncu = default
let nextPlayer = players.O; // Sıradaki oyuncu = default
let isTurnProcessing = false; // İşlem yapılıyor mu? (single da click ardından başlar ve pcnin oyunu işlendikten sonra sıra size geçene kadar devam eder...)

// GAMEBOARD 
let blockContainer = document.getElementById('game-board'); 
let gameBoard = Array(9).fill(null);
let winConditions = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],  // horizontal
  [0, 3, 6], [1, 4, 7], [2, 5, 8],  // vertical
  [0, 4, 8], [2, 4, 6], // cross
]

// HANDLE NEWGAME BUTTON
document.getElementById('newgame-button').addEventListener('click', newGame);

// HANDLE DIFFICULT BUTTON
const normalBtn = document.getElementById('normal-mode');
normalBtn.addEventListener('click', () => {
  if (isTurnProcessing === false && game.difficult !== normal) {
    game.difficult = normal;
    normalBtn.classList.add('active');
    hardBtn.classList.remove('active');
    newGame();
  } else {
    return
  }
});
const hardBtn = document.getElementById('hard-mode');
hardBtn.addEventListener('click', () => {
  if (isTurnProcessing === false && game.difficult !== hard) {
    game.difficult = hard;
    hardBtn.classList.add('active');
    normalBtn.classList.remove('active');
    newGame();
  } else {
    return
  }
});

// HANDLE GAME TYPE BUTTON
document.getElementById('game-type_container').addEventListener('click', () => {  // Oyun türünü değiştir ve yeni oyun başlat
  if (isTurnProcessing === false) {
    isSinglePlayerGame = !isSinglePlayerGame //oyun türünü değiştir
    // tekli veya çift oyuncu ise x dışında oynayan değişiklikleri 
    if (isSinglePlayerGame) {
      players.X.player = 'Player'
      players.O.player = 'Computer';
      game.type = 'P1';
    } else {
      players.X.player = 'Player 1';
      players.O.player = 'Player 2';
      game.type = 'P2';
    };
  
    newGame();  // Yeni oyun başlat
  } else {
    return
  }
})

function createCell() {
  for (let i = 0; i < gameBoard.length; i++) { 
    // Board containerına blockları ekle
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
    document.getElementById('game-board').appendChild(block); // gameboarda cell leri yaz
  }
}

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
    }, 2800);

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

// TODO: beraberlik boardın dolmasıyla değil ihtimaller kalmadığında gerçekleştirilmeli
// TODO: beraberlik durumunun kontrol edilmesi gereken minimum hamle sayısı
// TODO: win durumunun kontrol edilmesi gereken minimum hamle sayısı
function isWinOrDraw() {
  game.turn ++;

  for (let conditions of winConditions) {  // koşullardan üçlü koşullar çıkart ve her birine bir harf ata
    const [a, b, c] = conditions;
    
    // WIN CHECK
    if (game.turn >= 4 && 
      ([gameBoard[a], gameBoard[b], gameBoard[c]].every(v => v === players.X.key) ||
      [gameBoard[a], gameBoard[b], gameBoard[c]].every(v => v === players.O.key))) {
      
      const win = [a, b, c]; 
  
      winAnimation(win); // Kazanan için animasyonu oynat
      currentPlayer.score++; // Kazanan oyuncunun skorunu arttır
      console.log(`----------------------------${currentPlayer.player} kazandı! oyun baştan başlayacak...`);
      
      return true;
    }
  }
  
  // DRAW CHECK
  if (game.turn >= 9 && !winAnimation.isPlaying) {  // Kazanan yoksa ve 9. tura ulaşıldıysa
    drawAnimation();
    console.log('----------------------------Berabere bitti! Oyun baştan başlayacak...');
    
    return true;
  }
  
}

function winAnimation(win) {
  const unClickable = 3; // Null yerine atanacak oyuncu keyleri dışındaki random key başka rakamlar da olabilirdi...
  let cell;

  // WIN Elemanlarına win classı Ekle
  for (let i = 0; i < gameBoard.length; i++) {
    cell = blockContainer.childNodes[i].childNodes[0];

    // Kazanan hücrelere win sınıfı ekle
    if (win.includes(i)) {
      cell.classList.add('win');

    } else {
      if (gameBoard[i] === null) {
        gameBoard[i] = unClickable;
      }
      // Kazanmayan hücrelere 
      cell.classList.add('fade');
    }
  }
}

function drawAnimation() {
  const unClickable = 3; // Null yerine atanacak oyuncu keyleri dışındaki random key başka rakamlar da olabilirdi...
  let cell;
  // Beraberlik için tüm hücrelere fade sınıfı ekle
  for (let i = 0; i < gameBoard.length; i++) {
    cell = blockContainer.childNodes[i].childNodes[0]; 
    cell.classList.add('fade');
  }
}

  function turnAnimation() {
    // Tur değiştiğinde sonraki oyuncuyu karartan css class ı
    nextPlayer.container.classList.add('fade');
    currentPlayer.container.classList.remove('fade');
  }

function checkWinConditions() {
  const conditionsArr = [];

  for (let i = 0; i < winConditions.length; i++) {  // winConditions un mevcut board durumuna bak ve conditionsArr değişkenine aktar
    const [a, b, c] = winConditions[i]; // winConditionsdan çıkan move un elemanlarını parçalayıp indexlerini sırayla üç farklı değere aktar
    const conditions = [gameBoard[a], gameBoard[b], gameBoard[c]]; // kazanma koşulunun board indexindeki durumuna bakmak için değişkene aktar
    conditionsArr.push({ conditions, index: i }) // indexiyle beraber conditionsArr değişkenine aktar
  }

  // Possible Block Moves
  moves.blockMove = conditionsArr.filter(v => // conditionsArr ı gez
    v.conditions.filter(val => val === players.X.key).length === 2 && // conditions ı gez 2x varsa ve
    v.conditions.includes(null) // birisi nullsa
  ).map(v => ({ // filtrelediklerini key ve conditions objesine al
    index: v.index,
    conditions: v.conditions
  }));
  // console.log(matchingBlockMoves, 'Possible Random Block Moves');
  
  // Possible Random Finisher Moves
  moves.finisherMove = conditionsArr.filter(v => 
    v.conditions.filter(val => val === players.O.key).length === 2 && 
    v.conditions.includes(null)
  ).map(v => ({
    index: v.index,
    conditions: v.conditions
  }));
  // console.log(matchingFinisherMoves, 'Possible Random Finisher moves');

  // Possible Random 3/2 Moves
  moves.threeToTwo = conditionsArr.filter(v =>
    v.conditions.filter(val => val === players.O.key).length === 1 &&
    v.conditions.filter(val => val === null).length === 2
  ).map(v => ({
    index: v.index,
    conditions: v.conditions
  }));
  // console.log(matchingThreeToTwoMoves, 'Possible Random 3/2 Moves');

  // Possible Random 3/1 Moves
  moves.threeToOne = conditionsArr.filter(v =>
    v.conditions.filter(vol => vol === null).length === 3
  ).map(v => ({
    index: v.index,
    conditions: v.conditions
  }));
  // console.log(matchingRandomThreeToOneMoves, 'Possible Random 3/1 Moves');

  // Possible Middle Move in 3/1 Moves
  const middleMoves = [1, 4, 6, 7]
  moves.coverTheMiddle = moves.threeToOne.filter(v => (
    middleMoves.includes(v.index)) &&
    v.conditions[1] === null);
  // console.log(matchingMiddleMove, 'Possible Middle Move in 3/1 Moves');

  // Possible Random Blind Move
  moves.blindMove = conditionsArr.filter(v =>
    v.conditions.filter(vol => vol === null).length === 1
  ).map(v => ({
    index: v.index,
    conditions: v.conditions
  }));
  // console.log(matchingBlindMoves, 'Possible Random Blind Moves');
}

function computerMove() {
  rollTheDice();
  const playableMoves = selectMove();
  playMove(playableMoves);
}

function rollTheDice() {
  game.dice = Math.floor(Math.random() * 20) + 1; // 1-20 arasında rastgele bir sayı oluştur
  console.log(`attığınız zar ${game.dice}`);

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
  // Seçilen Hamlenin oynanabilir hamleleri dön
  return playableMoves;
};

function playMove (playableMoves) {

  let i;
  // Eğer hamle coverMiddle değilse
  if (playableMoves != 4) {
    const randomIndex = Math.floor(Math.random() * playableMoves.length); // PlayableMoves den random index üret
    const selectedMove = playableMoves[randomIndex]; // Üretilen indexle PlayableMoveden Selected Move çek
    const emptyCellsIndex = [];  

    for (let i = 0; i < selectedMove.conditions.length; i++) { // Seçilen Hamlenin içindeki boş değerleri indexlerini al
      if (selectedMove.conditions[i] === null) {
        emptyCellsIndex.push(i);
      }
    }
    const selectedMoveIndex = []; 

    if (emptyCellsIndex.length > 0) { // Boş değerlerin sayısı 0 dan fazlaysa
      const selectedIndex = emptyCellsIndex[Math.floor(Math.random() * emptyCellsIndex.length)];
      selectedMoveIndex.push(selectedIndex); // Rastgele birini seç ve seçilen hamle indexine yolla
    }
    // Başta seçilen hamlenin index özelliğiyle win conditionstan boarddaki indexini almak için win conditions indexiyle geri çağırıyoruz
    const callBackMove = winConditions[selectedMove.index] // GameBoardda karşılık gelen indexi alıyoruz
    i = callBackMove[selectedMoveIndex]; // i ye aktarıyoruz
  
  } else {
    i = 4;
  }
  // hücreye oyna
  const cell = blockContainer.children[i].childNodes[0];
  turnProcessing(i, cell);
}

function resetGame () {
  gameBoard.fill(null);  // Boardı ve hücreleri temizle
  blockContainer.innerHTML = '';
    // DOM u default değerlere eşitle
  document.getElementById('player-1_name').innerText = players.X.player + ' (X)';
  document.getElementById('player-1_score').innerText = players.X.score;
  document.getElementById('player-2_name').innerText = players.O.player + ' (O)';
  document.getElementById('player-2_score').innerText = players.O.score;
  document.getElementById('game-type-num').classList.remove('P1', 'P2');
  document.getElementById('game-type-num').classList.add(game.type);
  // Turu sıfırla
  game.turn = 0;
  createCell(); // hücreleri oluştur 
}

function newGame () {  // Defaultta yeni bir oyun başlatır
  if (isTurnProcessing === false) {
    players.X.score = 0; // Skorları ve başlayan oyuncuyu sıfırla
    players.O.score = 0;
    currentPlayer = players.X;
    nextPlayer = players.O;
    turnAnimation(); // Tur başında animasyonu ayarla
    resetGame(); // Boardı temizle
  }
}

newGame(); // Run the game