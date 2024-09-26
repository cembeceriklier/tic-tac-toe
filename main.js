import './style.css'

const normal = {
  blockMove: 6,
  threeToTwo: 5,
  threeToOne: 4,
}
const hard = {
  blockMove: 2,
  threeToTwo: 0,
  threeToOne: 0,
}

// TODO playersdan game çıkartılacak
// TODO Eğer conditionsta ihtimal yoksa seni blocklayacak hamleyi çıkartamıyor..
let players = {  // oyuncular ve oyun nitelikleri 
  Game: {
    type: 'P1',
    difficult: normal,
  },
  X: {
    name: 'X',
    key: 1,
    score: 0,
    player: 'Player',
  },
  Y: {
    name: 'O',
    key: 2,
    score: 0,
    player: 'Computer',
  }
}

let playerX = document.getElementById("player-1_container");
let playerO = document.getElementById("player-2_container");

let isSinglePlayerGame = true;  // varsayılan ilk oyuncu ve oyun türü
let currentPlayer = players.X;
let nextPlayer = players.Y;

let blockContainer = document.getElementById('game-board');  // Gameboard, winConditions ve gameBoard
let gameBoard = Array(9).fill(null);
let winConditions = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],  // horizontal
  [0, 3, 6], [1, 4, 7], [2, 5, 8],  // vertical
  [0, 4, 8], [2, 4, 6], // cross
]

function createCell() {
  for (let i = 0; i < 9; i++) { // 9 adet div oluştur ve her birine cell class ı ver
    const block = document.createElement('div');
    const cell = document.createElement('div');
    cell.classList.add('cell');
    block.classList.add('block')

    block.addEventListener('click', () => {  // Tıklama koşulu cell içi boşsa ve gameBoard indexideki değer null ise ve oyun singleplayer ise ve oyuncu x ise veya çoklu oyuncu ise.
      if ( cell.innerText == '' && gameBoard[i] === null && ( // eğer cell boşsa ve boarddaki i indexi boşsa ve oyun singleplayer ise ve oyuncu x ise veya çift oyuncu ise
        isSinglePlayerGame === true && currentPlayer === players.X || 
        !isSinglePlayerGame)) {


        if (isSinglePlayerGame) {  // oyun single ise

         // oyuncuyu değiştir pc oynayana kadar tıklayamasın
          currentPlayer = currentPlayer === players.X ? players.Y : players.X; 
          gameBoard[i] = players.X.key;  // oyun tahtasına x keyini ve hücreye ismi yaz
          cell.classList.add(players.X.name);

          if (turnResult() === true ) {  // skor varsa score arttır
            players.X.score++;
          };

        } else if (!isSinglePlayerGame) { // oyun çift ise
          nextPlayer = nextPlayer === players.X ? players.Y : players.X;
          if (nextPlayer === players.Y) {
            playerO.classList.add('fade');
            playerX.classList.remove('fade');
          } else if (nextPlayer === players.X) {
            playerX.classList.add('fade');
            playerO.classList.remove('fade');
          }
 
          gameBoard[i] = currentPlayer.key;  // Oynayan oyuncunun keyini ve ismini yaz
          cell.classList.add(currentPlayer.name);

          if (turnResult() === true) {  // oyun winse oynayan oyuncunun skorunu arttır
            currentPlayer.score++;
          };

          // Oyuncuyu değiştir
          currentPlayer = currentPlayer === players.X ? players.Y : players.X;
        }

      } else { // oyun single ise ve oyuncu y ise tıklayamazsın
        return
      }
    });
    block.appendChild(cell);
    document.getElementById('game-board').appendChild(block); // gameboarda cell leri yaz
  }
}

function turnResult() {
  if (checkWin() === true) { // Eğer win ise

    setTimeout(() => // Kazananın skorunu arttır, tahtayı temizle 2.5 sn
      clearBoard()
    , 2500);
  
    if (currentPlayer === players.Y && isSinglePlayerGame) { // Kaybeden sonraki el ilk başlasın eğer tek oyunculu ise ve oynama sırası bilgisayardaysa oynat 2.5sn sıfırlama 0.3 sn hamle
      setTimeout(() => 
      computerTurn()
      , 2800);
    } 
    return true; // True dön ve skor arttırılsın
    
  } else if (gameBoard.includes(null) === false) { // Eğer berabere ise boardı temizle 2.5 sn
    setTimeout(() => {
      clearBoard();
    }, 2500);

    if (currentPlayer === players.Y && isSinglePlayerGame) { // Oyun berabere ve oyuncu Y ise ve tek oyunculu ise Pc oynasın 2.5sn sıfırlama 0.3 sn hamle
      setTimeout(() => 
        computerTurn()
      , 2800);
    }
    console.log('----------------------------Berabere bitti! Oyun baştan başlayacak...');

    return false; // False dön ve skor arttırılmasın

  } else { // win yoksa 

    if (currentPlayer === players.Y && isSinglePlayerGame) { // Eğer oyuncu Y ise ve tek oyunculu ise Pc oynasın 0.3 sn
      setTimeout(() => 
        computerTurn()
      , 300);
    }

    return false // False dön ve skor arttırılmasın
  }
}

function checkWin() {

  for (let conditions of winConditions) {  // koşullardan üçlü koşullar çıkart ve her birine bir harf ata
    const [a, b, c] = conditions;
    
    // kazanma koşulları sağlanıyor mu
    if ([gameBoard[a], gameBoard[b], gameBoard[c]].every(v => v === players.X.key) ||
        [gameBoard[a], gameBoard[b], gameBoard[c]].every(v => v === players.Y.key)) {

      const win = [a, b, c]; 
       // kazanma animasyonu için kazanan diziye class win classı ata
      for (let i = 0; i < 3; i++) {
        blockContainer.childNodes[win[i]].childNodes[0].classList.add('win');  // Kazanan hücrelere 'win' sınıfı ekle
      }
    
      for (let i = 0; i < 9; i++) { // eğer kazanan varsa diğer boş hücrelerin hepsine 3 keyi ata (tıklanamasın diye) I'm sorry for this unsatisfactory solution, but I need to get some sleep
        if (gameBoard[i] === null) {
          gameBoard[i] = 3;
        }

        if (!win.includes(i)) { 
          blockContainer.childNodes[i].childNodes[0].classList.add('fade');
        }
      }

      console.log(`----------------------------${currentPlayer.player} kazandı! oyun baştan başlayacak...`)
      return true; 
    }
  }
  console.log(`----------${currentPlayer.player} oynadı. Devam ediyor...`);
  return false; 
}

function computerTurn() {

  const conditionsArr = [];
  for (let i = 0; i < winConditions.length; i++) {  // winConditions un mevcut board durumuna bak ve conditionsArr değişkenine aktar
    const [a, b, c] = winConditions[i]; // winConditionsdan çıkan move un elemanlarını parçalayıp indexlerini sırayla üç farklı değere aktar
    const conditions = [gameBoard[a], gameBoard[b], gameBoard[c]]; // kazanma koşulunun board indexindeki durumuna bakmak için değişkene aktar
    conditionsArr.push({ conditions, index: i }) // indexiyle beraber conditionsArr değişkenine aktar
  }

  const dice = Math.floor(Math.random() * 20) + 1; // 1-20 arasında rastgele bir sayı oluştur
  console.log(`attığınız zar ${dice}`);

  // Possible Block Moves
  const matchingBlockMoves = conditionsArr.filter(v => // conditionsArr ı gez
    v.conditions.filter(val => val === players.X.key).length === 2 && // conditions ı gez 2x varsa ve
    v.conditions.includes(null) // birisi nullsa
  ).map(v => ({ // filtrelediklerini key ve conditions objesine al
    index: v.index,
    conditions: v.conditions
  }));
  // console.log(matchingBlockMoves, 'Possible Random Block Moves');
  
  // Possible Random Finisher Moves
  const matchingFinisherMoves = conditionsArr.filter(v => 
    v.conditions.filter(val => val === players.Y.key).length === 2 && 
    v.conditions.includes(null)
  ).map(v => ({
    index: v.index,
    conditions: v.conditions
  }));
  // console.log(matchingFinisherMoves, 'Possible Random Finisher moves');

  // Possible Random 3/2 Moves
  const matchingThreeToTwoMoves = conditionsArr.filter(v =>
    v.conditions.filter(val => val === players.Y.key).length === 1 &&
    v.conditions.filter(val => val === null).length === 2
  ).map(v => ({
    index: v.index,
    conditions: v.conditions
  }));
  // console.log(matchingThreeToTwoMoves, 'Possible Random 3/2 Moves');

  // Possible Random 3/1 Moves
  const matchingRandomThreeToOneMoves = conditionsArr.filter(v =>
    v.conditions.filter(vol => vol === null).length === 3
  ).map(v => ({
    index: v.index,
    conditions: v.conditions
  }));
  // console.log(matchingRandomThreeToOneMoves, 'Possible Random 3/1 Moves');

  // Possible Random Blind Move
  const matchingBlindMoves = conditionsArr.filter(v =>
    v.conditions.filter(vol => vol === null).length === 1
  ).map(v => ({
    index: v.index,
    conditions: v.conditions
  }));
  // console.log(matchingBlindMoves, 'Possible Random Blind Moves');
    
  // Play Finisher Move ( KESİN HAMLE )
  if (matchingFinisherMoves.length > 0 && dice > 0){
    const moves = matchingFinisherMoves;
    Move(moves);
    console.log('finisher move');
  } // Play Block Move ( %20 SANS )
    else if (matchingBlockMoves.length > 0 && dice > players.Game.difficult.blockMove) {
      const moves = matchingBlockMoves;
      Move(moves);
      console.log('block move');
    } // Play 3/2 Move ( %50 SANS)
      else if (matchingThreeToTwoMoves.length > 0 && dice > players.Game.difficult.threeToTwo) {
        const moves = matchingThreeToTwoMoves;
        Move(moves);     
        console.log('3/1 move');
      } // Play Random Move 3/1 ( %100 SANS )
        else if (matchingRandomThreeToOneMoves.length > 0) {
          const moves = matchingRandomThreeToOneMoves;
          Move(moves);
          console.log('random move 3/0');
        } //  Play Blind Move ( %100 SANS )
          else if (matchingBlindMoves.length > 0) {
            const moves = matchingBlindMoves;
            Move(moves);
            console.log('blind move');
          }
  else {
    turnResult(); // Eğer boşluk yoksa turn result çalışır ve içeride berabere ilan edilir
  }
}

function Move(moves) {
  const randomIndex = Math.floor(Math.random() * moves.length);  // Çoklu hamle imkanında rasthele bir hamle al
  const selectedMove = moves[randomIndex];
  const emptyCellsIndex = [];  // Seçilen hamlenin içinden null değerlerinin indexini al
  
  for (let i = 0; i < selectedMove.conditions.length; i++) {
    if (selectedMove.conditions[i] === null) {
      emptyCellsIndex.push(i);
    }
  }
  const selectedMoveIndex = []; // indexlerinin dizelerinin uzunluğu 0 dan büyükse
  if (emptyCellsIndex.length > 0) {
    // seçilen index: içindeki oynaması mümkün indexlerin rastgele birini seç
    const selectedIndex = emptyCellsIndex[Math.floor(Math.random() * emptyCellsIndex.length)];
    selectedMoveIndex.push(selectedIndex);
  }
  const callBackMove = winConditions[selectedMove.index]  // başta getirilen hamleyi geri winConditions indexiyle geri çağır
  const cellToPlay = callBackMove[selectedMoveIndex];  // Seçilen hücreyi winConditionsdaki indexine aktar
  // hücreye oyna
  const cellToUpdate = blockContainer.children[cellToPlay].childNodes[0];
  gameBoard[cellToPlay] = players.Y.key;
  cellToUpdate.classList.add(players.Y.name);
  currentPlayer = currentPlayer === players.X ? players.Y : players.X;
  if (turnResult() === true){
    players.Y.score++; // true dönerse skoru arttır
  };
}

const normalBtn =document.getElementById('normal-mode');
normalBtn.addEventListener('click', () => {
  if (players.Game.difficult !== normal) {
    players.Game.difficult = normal;
    normalBtn.classList.add('active');
    hardBtn.classList.remove('active');
    newGame();
  }
});
const hardBtn = document.getElementById('hard-mode');
hardBtn.addEventListener('click', () => {
  if (players.Game.difficult !== hard) {
    players.Game.difficult = hard;
    hardBtn.classList.add('active');
    normalBtn.classList.remove('active');
    newGame();
  }
});

document.getElementById('newgame-button').addEventListener('click', newGame);
document.getElementById('game-type_container').addEventListener('click', () => {  // Oyun türünü değiştir ve yeni oyun başlat
  isSinglePlayerGame = !isSinglePlayerGame //oyun türünü değiştir
  // tekli veya çift oyuncu ise x dışında oynayan değişiklikleri 
  if (isSinglePlayerGame) {
    // imgContainer.children[0].classList.remove('hidden');
    // imgContainer.children[1].classList.add('hidden');
    players.X.player = 'Player'
    players.Y.player = 'Computer';
    players.Game.type = 'P1';
    if (nextPlayer === players.Y) {
      playerO.classList.remove('fade');
    } else {
      playerX.classList.remove('fade');
    }

  } else {
    // imgContainer.children[1].classList.remove('hidden');
    // imgContainer.children[0].classList.add('hidden');
    players.X.player = 'Player 1';
    players.Y.player = 'Player 2';
    players.Game.type = 'P2';

    playerO.classList.add('fade');
  };

  newGame();  // yeni oyun başlat
  console.log(nextPlayer);
})

function clearBoard () {
  gameBoard.fill(null);  // boardı ve hücreleri temizle
  blockContainer.innerHTML = '';
  blockContainer.classList.remove('disabled'); // tur kazanıldığında eklenen disabled classlarını kaldır

   // değişkenlere bakıp html yapısını güncelle
  document.getElementById('player-1_name').innerText = players.X.player + ' (X)'
  document.getElementById('player-1_score').innerText = players.X.score
  document.getElementById('player-2_name').innerText = players.Y.player + ' (O)'
  document.getElementById('player-2_score').innerText = players.Y.score
  document.getElementById('game-type-num').classList.remove('P1', 'P2')
  document.getElementById('game-type-num').classList.add(players.Game.type)

  createCell(); // hücreleri oluştur
}

function newGame () {  // Defaultta yeni bir oyun başlatır
  players.X.score = 0; // skorları ve başlayan oyuncuyu sıfırla
  players.Y.score = 0;
  currentPlayer = players.X;
  nextPlayer = players.Y;
  clearBoard(); // boardı temizle
}

newGame(); // Run the game

// TODO: 1P 2P değişirken img yetişemiyor. 
// TODO-2: Player 1 ve player 2 yazısı ile skor yazısının arasını biraz daha aç. (tamam)
// TODO-3: 1P 2P yazısının fontunu büyüt ya da kalınlaştır.
// TODO-4: New Game butonu ekle
// TODO-5: 3 Zorluk belirle ve hamlelere gereken zarları zorluklara göre ayarla.
// TODO-6: 3 Zorluk derecesinin seçileceği bir arayüz ekle.
// TODO-7: Animasyonları düzenle. 
// TODO-8: Hücre oynanış animasyonu eklenebilir. Her tıkladığında...

