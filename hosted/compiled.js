'use strict';

// using gravity assignment
var setUser = function setUser(data) {

  // if you are the new user, set your data
  if (!hash) {
    console.log('setting user');
    room = data.room;
    hash = data.hash;
    myNum = data.playerCount;
    data.next = myNum;
    framesPassedSinceLetter = 0;
    correctPress = false;
    timeToPress = 180;
    myScore = 10;
  }

  console.log('myNum = ' + myNum);

  var content = document.querySelector('#mainMessage');
  ctx.clearRect(0, 0, CANVASWIDTH, CANVASHEIGHT);
  ctx.fillStyle = 'white';
  ctx.font = '20px serif';
  ctx.fillText('Player Count: ' + data.playerCount + '/3', CWHALF - 70, CHHALF);
  content.innerHTML = 'Player Count: ' + data.playerCount + '/3';

  if (myNum === 3) {
    setTimeout(passPotato(data), 2000);
  }
};

// passes the potato to the next person
var passPotato = function passPotato(data) {

  // set the styles
  ctx.clearRect(0, 0, CANVASWIDTH, CANVASHEIGHT);
  ctx.fillStyle = 'white';
  ctx.font = '30px serif';

  //saving the potatoPossessor
  potatoPossessor = data.next;
  console.log(potatoPossessor + " is the potatoPossessor");

  // player with potato div
  var content = document.querySelector('#mainMessage');

  if (data.primaryPotato) {
    // is this the first round?
    // allow the primary potato to start the game with hot potato in hand
    if (data.primaryPotato === myNum) {

      ctx.fillText('You have the potato!', CWHALF - 110, CHHALF);
      content.innerHTML = '<div>You have the potato!</div>';
      setTimeout(displayPotato, 3000);
    } else {
      ctx.fillText('Player ' + data.next + ' has the potato', CWHALF - 130, CHHALF);
      content.innerHTML = '<div>Player ' + data.primaryPotato + ' has the potato</div>';
    }
  } else {
    // it is not the first round
    if (potatoPossessor === myNum) {
      timeToPress = 180; // initial potato delay set to 3 seconds
      ctx.fillText('You have the potato!', CWHALF - 110, CHHALF);
      content.innerHTML = '<div>You have the potato!</div>';
      canPass = false;
      setTimeout(displayPotato, 3000);
    } else {
      ctx.fillText('Player ' + data.next + ' has the potato', CWHALF - 130, CHHALF);
      content.innerHTML = '<div>Player ' + data.next + ' has the potato</div>';
    }
  }
};

// displays the potato with the letter
var displayPotato = function displayPotato() {

  document.body.addEventListener('keydown', keyDownHandler);
  document.body.addEventListener('keyup', keyUpHandler);

  randomNum = 4;

  while (randomNum === 4) {
    randomNum = Math.floor(Math.random() * 4);
  }

  // create the potato
  ctx.clearRect(0, 0, CANVASWIDTH, CANVASHEIGHT);
  ctx.strokeStyle = 'blue';
  ctx.font = '60px serif';
  ctx.fillStyle = '#D9865D';
  ctx.beginPath();
  ctx.arc(CWHALF, CHHALF, 200, 0, 2 * Math.PI);
  ctx.stroke();
  ctx.fill();

  potateImg = new Image();

  displayLetter(randomNum);

  console.log('displaying potato');
  canPass = true;
};

// displays the potates and the letters so the players know what to press
var displayLetter = function displayLetter(randomNum) {

  potateImg.width = 30;
  potateImg.height = 30;

  if (randomNum === 0) {
    ctx.fillText('W', 0, 100);
    potateImg.src = '../assets/img/potate1.png';
    ctx.drawImage(potateImg, CWHALF / 1.3, 0);
    currentLetter = 'w';
    requestAnimationFrame(function () {
      update('w');
    });
  } else if (randomNum === 1) {
    ctx.fillText('A', 0, 100);
    potateImg.src = '../assets/img/potate2.png';
    ctx.drawImage(potateImg, CWHALF / 1.8, 0);
    currentLetter = 'a';
    requestAnimationFrame(function () {
      update('a');
    });
  } else if (randomNum === 2) {
    ctx.fillText('S', 0, 100);
    potateImg.src = '../assets/img/potate3.png';
    ctx.drawImage(potateImg, CWHALF / 1.5, CHHALF / 3.3);
    currentLetter = 's';
    requestAnimationFrame(function () {
      update('s');
    });
  } else {
    ctx.fillText('D', 0, 100);
    potateImg.src = '../assets/img/potate4.png';
    ctx.drawImage(potateImg, CWHALF / 1.4, CHHALF / 3);
    currentLetter = 'd';
    requestAnimationFrame(function () {
      update('d');
    });
  }
};

// checks for button presses
var update = function update(letter) {

  // animates the heat meter
  ctx.fillStyle = '#CE100B';
  ctx.fillRect(framesPassedSinceLetter / timeToPress * CANVASWIDTH, 0, 30, 30);

  // displays 'HOT' on the screen indicating that the potate is hot
  if (framesPassedSinceLetter % 60 === 0) {

    var randX = Math.abs(Math.random() * CANVASWIDTH - 300);
    randX += 100;
    var randY = Math.abs(Math.random() * CANVASHEIGHT - 200);
    randY += 75;
    ctx.fillText('HOT', randX, randY);
  }

  framesPassedSinceLetter++;

  if (framesPassedSinceLetter > timeToPress) {
    console.log('Hash: ' + hash);
    myScore = 0;
    socket.emit('fail', { room: room, hash: hash });
    return;
  }

  // if they pressed the right button, display the next letter
  if (correctPress) {

    if (timeToPress > 30) {
      // make it go speedy faster every press
      timeToPress *= 0.9;
    }

    myScore += 10; // correct! Gain 10 points

    framesPassedSinceLetter = 0;
    correctPress = false;
    displayPotato();
  } else if (canPass && !GameOver) {
    requestAnimationFrame(update);
  }
};

var sendPoints = function sendPoints(data) {
  console.log('Hash: ' + data.hash);
  canPass = false;
  highScore = myScore; // give the high score a base to start off at
  socket.emit('myScore', { myHash: hash, hash: data.hash, myScore: myScore, room: room, myNum: myNum });
};

//handle for key down events
var keyDownHandler = function keyDownHandler(e) {
  var keyPressed = e.which;

  // W
  if (keyPressed === 87 || keyPressed === 38) {
    wDown = true;
    if (currentLetter === 'w') {
      correctPress = true;
    } else {
      console.log('hash: ' + hash);
      myScore = 0;
      socket.emit('fail', { room: room, hash: hash });
    }
  }
  // A
  else if (keyPressed === 65 || keyPressed === 37) {
      aDown = true;
      if (currentLetter === 'a') {
        correctPress = true;
      } else {
        console.log('hash: ' + hash);
        myScore = 0;
        socket.emit('fail', { room: room, hash: hash });
      }
    }
    // S
    else if (keyPressed === 83 || keyPressed === 40) {
        sDown = true;
        if (currentLetter === 's') {
          correctPress = true;
        } else {
          console.log('hash: ' + hash);
          myScore = 0;
          socket.emit('fail', { room: room, hash: hash });
        }
      }
      // D
      else if (keyPressed === 68 || keyPressed === 39) {
          dDown = true;
          if (currentLetter === 'd') {
            correctPress = true;
          } else {
            console.log('hash: ' + hash);
            myScore = 0;
            socket.emit('fail', { room: room, hash: hash });
          }
        }
        //tab key was pressed
        else if (keyPressed === 9) {
            if (potatoPossessor === myNum && canPass) {

              document.body.removeEventListener('keydown', keyDownHandler);
              document.body.removeEventListener('keyup', keyUpHandler);

              ctx.clearRect(0, 0, CANVASWIDTH, CANVASHEIGHT);
              framesPassedSinceLetter = 0; // reset the frames to lose
              canPass = false;
              console.log('passing');
              socket.emit('pass', { room: room, hash: hash, myNum: myNum });
            } else {
              console.log(potatoPossessor + " is the potatoPossessor, and I am " + myNum);
            }
          }
};

//handler for key up events
var keyUpHandler = function keyUpHandler(e) {
  var keyPressed = e.which;

  // W OR UP
  if (keyPressed === 87 || keyPressed === 38) {
    wDown = false;
  }
  // A OR LEFT
  else if (keyPressed === 65 || keyPressed === 37) {
      aDown = false;
    }
    // S OR DOWN
    else if (keyPressed === 83 || keyPressed === 40) {
        sDown = false;
      }
      // D OR RIGHT
      else if (keyPressed === 68 || keyPressed === 39) {
          dDown = false;
        }
};
'use strict';

// using code from DomoMaker E by Aidan Kaufman
var handleError = function handleError(message) {
  $("#errorMessage").text(message);
};

var redirect = function redirect(response) {
  window.location = response.redirect;
};

var sendAjax = function sendAjax(type, action, data, success) {
  $.ajax({

    cache: false,
    type: type,
    url: action,
    data: data,
    dataType: 'json',
    success: success,
    error: function error(xhr, status, _error) {

      var messageObj = JSON.parse(xhr.responseText);
      handleError(messageObj.error);
    }
  });
};

var sendAjaxHTML = function sendAjaxHTML(type, action, data, success) {
  $.ajax({

    cache: false,
    type: type,
    url: action,
    data: data,
    dataType: 'html',
    success: success,
    error: function error(xhr, status, _error2) {

      var messageObj = xhr.responseText;
      handleError(messageObj.error);
    }
  });
};
'use strict';

// credit to Project2-590 by Aidan Kaufman
// credit to Lauren Schneider for the potate drawings
var canvas = void 0;
var ctx = void 0;

var socket = void 0;
var hash = void 0;
var room = void 0;
var myNum = void 0;
var players = {}; //character list'
var potatoPossessor = void 0;
var GameOver = false;

var animationFrame = void 0;
var frameCounter = void 0;

var timeToPress = void 0;
var canPass = false;
var randomNum = void 0;
var correctPress = void 0;
var currentLetter = void 0;
var potatoPrompt = void 0;
var potateImg = void 0;
var framesPassedSinceLetter = void 0;
var myScore = void 0;
var highScore = void 0;
var wDown = void 0,
    aDown = void 0,
    sDown = void 0,
    dDown = void 0;
var displayMessageCount = 0;

var CANVASWIDTH = 800;
var CWHALF = 400;
var CANVASHEIGHT = 400;
var CHHALF = 200;

// what to do when the player presses join game
var handleJoinGame = function handleJoinGame() {
  console.log('join GAME clicked');

  // setup the canvas
  canvas = document.querySelector('#canvas');
  ctx = canvas.getContext('2d');

  socket.emit('requestAccess', {});
};

var renderJoinGame = function renderJoinGame() {
  return React.createElement(
    'canvas',
    { id: 'canvas', height: 400, width: 800 },
    'Please use an HTML 5 browser to play Hot Potates!'
  );
};

var createJoinGame = function createJoinGame(csrf) {
  var JoinGameWindow = React.createClass({
    displayName: 'JoinGameWindow',

    componentDidMount: handleJoinGame,
    render: renderJoinGame
  });

  ReactDOM.render(React.createElement(JoinGameWindow, { csrf: csrf }), document.querySelector("#content"));
};

var renderSearchButton = function renderSearchButton() {
  return React.createElement(
    'form',
    { id: 'searchForm',
      onSubmit: this.handleSearch,
      name: 'searchForm',
      action: '/',
      method: 'GET',
      className: 'searchForm'
    },
    React.createElement('input', { className: 'logout', type: 'submit', value: 'Search for Game' })
  );
};

var createSearchButton = function createSearchButton(csrf) {
  var SearchButtonWindow = React.createClass({
    displayName: 'SearchButtonWindow',

    handleSearch: createJoinGame,
    render: renderSearchButton
  });

  ReactDOM.render(React.createElement(SearchButtonWindow, { csrf: csrf }), document.querySelector("#content"));
};

var renderMainMenu = function renderMainMenu() {
  return React.createElement(
    'h2',
    { className: 'title' },
    'Hot Potates: Don\'t Drop'
  );
};
var clearScreen = function clearScreen() {
  var content = document.querySelector("#content");
  content = "";
};
var createMainMenu = function createMainMenu(csrf) {
  var MainMenuWindow = React.createClass({
    displayName: 'MainMenuWindow',

    componentDidMount: clearScreen,
    render: renderMainMenu
  });

  ReactDOM.render(React.createElement(MainMenuWindow, { csrf: csrf }), document.querySelector("#titleHere"));
};
var renderInstructions = function renderInstructions() {
  return React.createElement(
    'div',
    { id: 'instructionsContent' },
    React.createElement(
      'div',
      null,
      'Goal: Get the most points, and don\'t get burned!'
    ),
    React.createElement(
      'div',
      null,
      'Getting burned: You get burned by pressing the wrong button, or letting the timer hit the right side of the screen!'
    ),
    React.createElement(
      'div',
      null,
      'Getting points: When you have the potate, press the buttons on the left side of the screen.'
    ),
    React.createElement(
      'div',
      null,
      'Be warned: The more you press the correct buttons, the faster you have to react!'
    ),
    React.createElement(
      'div',
      null,
      'Press the tab button to pass the potato to the next player and cool down!'
    )
  );
};

// displaying instructions
var createInstructions = function createInstructions(csrf) {
  var InstructionsWindow = React.createClass({
    displayName: 'InstructionsWindow',

    render: renderInstructions
  });

  ReactDOM.render(React.createElement(InstructionsWindow, { csrf: csrf }), document.querySelector("#content"));
};

var renderLogout = function renderLogout() {
  return React.createElement(
    'form',
    { id: 'logoutForm',
      onSubmit: this.handleLogout,
      name: 'logoutForm',
      action: '/logout',
      method: 'GET',
      className: 'logoutForm'
    },
    React.createElement(
      'div',
      { id: 'logoutMessage' },
      'Are you sure you want to logout?'
    ),
    React.createElement('input', { className: 'logout', type: 'submit', value: 'Logout' })
  );
};

// displaying instructions
var createLogout = function createLogout(csrf) {
  var LogoutWindow = React.createClass({
    displayName: 'LogoutWindow',

    handleLogout: logout,
    render: renderLogout
  });

  ReactDOM.render(React.createElement(LogoutWindow, { csrf: csrf }), document.querySelector("#content"));
};

var logout = function logout() {
  console.log('logout clicked');
  sendAjaxHTML('GET', '/logout', null, redirect);
};

var endGame = function endGame(data) {

  var content = document.querySelector('#mainMessage');

  ctx.clearRect(0, 0, CANVASWIDTH, CANVASHEIGHT);

  // increases the high score for better winner logic
  if (data.score >= highScore) {
    highScore = data.score;
  }

  if (data.hash === null && GameOver === false) {
    content.innerHTML = 'Oh no, someone left!';
  } else if (data.hash === data.myHash) {
    var results = document.querySelector('#results');
    results.innerHTML += '<div class="endingMessage">Player ' + data.num + ' got burned and lost!</div>';
    if (data.hash === hash) content.innerHTML = 'You lose!';
  } else if (data.hash !== null) {
    if (myScore === 0) {
      content.innerHTML = 'You lose!';
    } else if (highScore <= myScore) {
      highScore = myScore;
      content.innerHTML = 'You win!';
    } else {
      content.innerHTML = 'You lived!';
    }
    GameOver = true;
    var _results = document.querySelector('#results');
    _results.innerHTML += '<div class="endingMessage">Player ' + data.num + '\'s score is: ' + data.score + '</div>';
  }

  console.log('removing canvas');
  // turn off eventListeners
  $('canvas').remove();
  document.body.removeEventListener('keydown', keyDownHandler);
  document.body.removeEventListener('keyup', keyUpHandler);

  var playAgainButton = document.querySelector('#playAgain');
  playAgainButton.innerHTML = '<input class="playAgain" type="button" value="Play Again?" />';
  playAgainButton.onclick = playAgain;
};

// main menu
var mainMenu = function mainMenu() {
  console.log('main menu');
  var content = document.querySelector('#mainMessage');
  content.innerHTML = "";
};

// reload the page
var playAgain = function playAgain() {
  console.log('reloading');
  location.reload();
};

var init = function init(csrf) {

  socket = io.connect();

  socket.on('connect', function () {

    socket.on('joined', setUser);
    socket.on('passingToNext', passPotato);
    socket.on('askPoints', sendPoints);
    socket.on('endingGame', endGame);

    var joinButton = document.querySelector('#joinButton');
    var instructionsButton = document.querySelector('#instructions');
    var mainMenuButton = document.querySelector('#mainMenuButton');
    var logoutButton = document.querySelector('#logoutButton');

    createMainMenu(csrf);

    mainMenuButton.addEventListener("click", function (e) {
      e.preventDefault();
      createMainMenu(csrf);
      return false;
    });

    joinButton.addEventListener("click", function (e) {
      e.preventDefault();
      createSearchButton(csrf);
      return false;
    });

    instructionsButton.addEventListener("click", function (e) {
      e.preventDefault();
      createInstructions(csrf);
      return false;
    });

    logoutButton.addEventListener("click", function (e) {
      e.preventDefault();
      createLogout(csrf);
      return false;
    });
  });
};

var getToken = function getToken() {
  sendAjax("GET", "/getToken", null, function (result) {
    init(result.csrfToken);
  });
};

$(document).ready(function () {
  getToken();
});
