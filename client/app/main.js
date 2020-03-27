// credit to Project2-590 by Aidan Kaufman
// credit to Lauren Schneider for the potate drawings
let canvas;
let ctx;

let socket;
let hash;
let room;
let myNum;
let players = {}; //character list'
let potatoPossessor;
let GameOver = false;


let animationFrame;
let frameCounter;

let timeToPress;
let canPass = false;
let randomNum;
let correctPress;
let currentLetter;
let potatoPrompt;
let potateImg;
let framesPassedSinceLetter;
let myScore;
let highScore;
let wDown, aDown, sDown, dDown;
let displayMessageCount = 0;

const CANVASWIDTH = 800;
const CWHALF = 400;
const CANVASHEIGHT = 400;
const CHHALF = 200;

// what to do when the player presses join game
const handleJoinGame = () => {
  console.log('join GAME clicked');
  
  // setup the canvas
  canvas = document.querySelector('#canvas');
  ctx = canvas.getContext('2d');
  
  socket.emit('requestAccess', {});
};

const renderJoinGame = function() {
  return (
    <canvas id="canvas" height={400} width={800}>Please use an HTML 5 browser to play Hot Potates!</canvas>
  );
};    

const createJoinGame = function (csrf) {
  const JoinGameWindow = React.createClass({
    componentDidMount: handleJoinGame,
    render: renderJoinGame
  });
    
  ReactDOM.render(
    <JoinGameWindow csrf={csrf} />,
    document.querySelector("#content")
  );
};

const renderSearchButton = function() {
  return (
    <form id="searchForm" 
      onSubmit={this.handleSearch}
      name="searchForm"
      action="/"
      method="GET"
      className="searchForm"
    >
      <input className="logout" type="submit" value="Search for Game" />
    </form>  
  );
};    

const createSearchButton = function (csrf) {
  const SearchButtonWindow = React.createClass({
    handleSearch: createJoinGame,
    render: renderSearchButton
  });
    
  ReactDOM.render(
    <SearchButtonWindow csrf={csrf} />,
    document.querySelector("#content")
  );
};

const renderMainMenu = function() {
  return (
      <h2 className="title">
        Hot Potates: Don't Drop
      </h2>
    );
};
const clearScreen = function() {
  let content = document.querySelector("#content");
  content = "";
};
const createMainMenu = function (csrf) {
  const MainMenuWindow = React.createClass({
    componentDidMount: clearScreen,
    render: renderMainMenu
  });
    
  ReactDOM.render(
    <MainMenuWindow csrf={csrf} />,
    document.querySelector("#titleHere")
  );
};
const renderInstructions = function() {
  return (
      <div id="instructionsContent">
        <div>Goal: Get the most points, and don't get burned!</div>
        <div>Getting burned: You get burned by pressing the wrong button, or letting the timer hit the right side of the screen!</div>
        <div>Getting points: When you have the potate, press the buttons on the left side of the screen.</div>
        <div>Be warned: The more you press the correct buttons, the faster you have to react!</div>
        <div>Press the tab button to pass the potato to the next player and cool down!</div>
      </div>
    );
};

// displaying instructions
const createInstructions = function (csrf) {
  const InstructionsWindow = React.createClass({
    render: renderInstructions
  });
    
  ReactDOM.render(
    <InstructionsWindow csrf={csrf} />,
    document.querySelector("#content")
  );
};

const renderLogout = function() {
  return (
    
      <form id="logoutForm" 
      onSubmit={this.handleLogout}
      name="logoutForm"
      action="/logout"
      method="GET"
      className="logoutForm"
    >
      <div id="logoutMessage">Are you sure you want to logout?</div>
      <input className="logout" type="submit" value="Logout" />
    </form>  
    );
};

// displaying instructions
const createLogout = function (csrf) {
  const LogoutWindow = React.createClass({
    handleLogout: logout,
    render: renderLogout
  });
    
  ReactDOM.render(
    <LogoutWindow csrf={csrf} />,
    document.querySelector("#content")
  );
};

const logout = () => {
  console.log('logout clicked');
  sendAjaxHTML('GET', '/logout', null, redirect);
};
 
const endGame = (data) => {
    
  let content = document.querySelector('#mainMessage');
  
  ctx.clearRect(0,0,CANVASWIDTH,CANVASHEIGHT);
  
  // increases the high score for better winner logic
  if(data.score >= highScore) {
    highScore = data.score;
  }
  
    if(data.hash === null && GameOver === false) {
      content.innerHTML = 'Oh no, someone left!';
    }
    else if(data.hash === data.myHash) {
      let results = document.querySelector('#results');
      results.innerHTML += `<div class="endingMessage">Player ${data.num} got burned and lost!</div>`;
      if(data.hash === hash) content.innerHTML = 'You lose!';
    } else if(data.hash !== null) {
      if(myScore === 0) {
        content.innerHTML = 'You lose!';
      } else if(highScore <= myScore){
        highScore = myScore;
        content.innerHTML = 'You win!';
      } else {
        content.innerHTML = 'You lived!';
      }
      GameOver = true;
      let results = document.querySelector('#results');
      results.innerHTML += `<div class="endingMessage">Player ${data.num}'s score is: ${data.score}</div>`;
    }
  
  
  console.log('removing canvas');
  // turn off eventListeners
  $('canvas').remove();
  document.body.removeEventListener('keydown', keyDownHandler);
  document.body.removeEventListener('keyup', keyUpHandler);
  
  let playAgainButton = document.querySelector('#playAgain');
  playAgainButton.innerHTML = '<input class="playAgain" type="button" value="Play Again?" />';
  playAgainButton.onclick = playAgain;
};

// main menu
const mainMenu = () => {
  console.log('main menu');
  let content = document.querySelector('#mainMessage');
  content.innerHTML = "";
};

// reload the page
const playAgain = () => {
  console.log('reloading');
  location.reload();
};

const init = (csrf) => {
  
  socket = io.connect();
  
  socket.on('connect', () => {
    
    socket.on('joined', setUser);
    socket.on('passingToNext', passPotato);
    socket.on('askPoints', sendPoints);
    socket.on('endingGame', endGame);
    
    const joinButton = document.querySelector('#joinButton');
    const instructionsButton = document.querySelector('#instructions');
    const mainMenuButton = document.querySelector('#mainMenuButton');
    const logoutButton = document.querySelector('#logoutButton');
    
    createMainMenu(csrf);
    
    mainMenuButton.addEventListener("click", (e) => {
      e.preventDefault();
      createMainMenu(csrf);
      return false;
    });
    
    joinButton.addEventListener("click", (e) => {
      e.preventDefault();
      createSearchButton(csrf);
      return false;
    });
    
    instructionsButton.addEventListener("click", (e) => {
      e.preventDefault();
      createInstructions(csrf);
      return false;
    });
    
    logoutButton.addEventListener("click", (e) => {
      e.preventDefault();
      createLogout(csrf);
      return false;
    });
    
  });
  
};

const getToken = () => {
  sendAjax("GET", "/getToken", null, (result) => {
    init(result.csrfToken);
  });
};

$(document).ready(function() {
  getToken();
});







