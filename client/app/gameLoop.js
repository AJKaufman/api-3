// using gravity assignment
const setUser = (data) => {
  
  // if you are the new user, set your data
  if(!hash){
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
  
  const content = document.querySelector('#mainMessage');
  ctx.clearRect(0,0,CANVASWIDTH,CANVASHEIGHT);
  ctx.fillStyle = 'white';
  ctx.font = '20px serif';
  ctx.fillText('Player Count: ' + data.playerCount + '/3', CWHALF - 70, CHHALF);
  content.innerHTML = 'Player Count: ' + data.playerCount + '/3';

  if(myNum === 3) {
    setTimeout(passPotato(data), 2000);
  }
  
}

// passes the potato to the next person
const passPotato = (data) => {

  // set the styles
  ctx.clearRect(0,0,CANVASWIDTH,CANVASHEIGHT);
  ctx.fillStyle = 'white';
  ctx.font = '30px serif';
  
  //saving the potatoPossessor
  potatoPossessor = data.next;
  console.log(potatoPossessor + " is the potatoPossessor");
  
  // player with potato div
  let content = document.querySelector('#mainMessage');
  
  if(data.primaryPotato){ // is this the first round?
    // allow the primary potato to start the game with hot potato in hand
    if(data.primaryPotato === myNum) {
      
      ctx.fillText(`You have the potato!`, CWHALF - 110, CHHALF);
      content.innerHTML = `<div>You have the potato!</div>`
      setTimeout(displayPotato, 3000);
    } else {
      ctx.fillText(`Player ${data.next} has the potato`, CWHALF - 130, CHHALF);
      content.innerHTML = `<div>Player ${data.primaryPotato} has the potato</div>`;
    }
  } else { // it is not the first round
    if(potatoPossessor === myNum){
      timeToPress = 180; // initial potato delay set to 3 seconds
      ctx.fillText(`You have the potato!`, CWHALF - 110, CHHALF);
      content.innerHTML = `<div>You have the potato!</div>`
      canPass = false;
      setTimeout(displayPotato, 3000);
    } else {
      ctx.fillText(`Player ${data.next} has the potato`, CWHALF - 130, CHHALF);
      content.innerHTML = `<div>Player ${data.next} has the potato</div>`;
    }
  }
  
  
}

// displays the potato with the letter
const displayPotato = () => {
  
  document.body.addEventListener('keydown', keyDownHandler);
  document.body.addEventListener('keyup', keyUpHandler);
  
  randomNum = 4;

  while(randomNum === 4) {
    randomNum = Math.floor(Math.random() * 4);
  }
    
  // create the potato
  ctx.clearRect(0,0,CANVASWIDTH,CANVASHEIGHT);
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
}

// displays the potates and the letters so the players know what to press
const displayLetter = (randomNum) => {
  
  potateImg.width = 30;
  potateImg.height = 30;
  
  if(randomNum === 0) {
    ctx.fillText('W', 0, 100);
    potateImg.src = '../assets/img/potate1.png';
    ctx.drawImage(potateImg, CWHALF / 1.3, 0);
    currentLetter = 'w';
    requestAnimationFrame(() => {
          update('w');
    });
  } else if(randomNum === 1) {
    ctx.fillText('A', 0, 100);
    potateImg.src = '../assets/img/potate2.png';
    ctx.drawImage(potateImg, CWHALF / 1.8, 0);
    currentLetter = 'a';
    requestAnimationFrame(() => {
          update('a');
      });
  } else if(randomNum === 2) {
    ctx.fillText('S', 0, 100);
    potateImg.src = '../assets/img/potate3.png';
    ctx.drawImage(potateImg, CWHALF / 1.5, CHHALF / 3.3);
    currentLetter = 's';
    requestAnimationFrame(() => {
          update('s');
    });
  } else {
    ctx.fillText('D', 0, 100);
    potateImg.src = '../assets/img/potate4.png';
    ctx.drawImage(potateImg, CWHALF / 1.4, CHHALF / 3);
    currentLetter = 'd';
    requestAnimationFrame(() => {
          update('d');
    });
  }
};

// checks for button presses
const update = (letter) => {
  
  // animates the heat meter
  ctx.fillStyle = '#CE100B';
  ctx.fillRect((framesPassedSinceLetter / timeToPress) * CANVASWIDTH, 0, 30, 30);
  
  // displays 'HOT' on the screen indicating that the potate is hot
  if(framesPassedSinceLetter % 60 === 0) {
    
    let randX = Math.abs(Math.random() * CANVASWIDTH - 300);
    randX += 100;
    let randY = Math.abs(Math.random() * CANVASHEIGHT - 200);
    randY += 75;
    ctx.fillText('HOT', randX, randY);
  }
  
  framesPassedSinceLetter++;
  
  
  if(framesPassedSinceLetter > timeToPress) {
    console.log('Hash: ' + hash);
    myScore = 0;
    socket.emit('fail', { room: room, hash: hash });
    return;
  }
  
  // if they pressed the right button, display the next letter
  if(correctPress){
    
    if(timeToPress > 30) { // make it go speedy faster every press
      timeToPress *= 0.9;
    }
    
    myScore += 10; // correct! Gain 10 points
    
    framesPassedSinceLetter = 0;
    correctPress = false;
    displayPotato();
  } else if (canPass && !(GameOver)) {
    requestAnimationFrame(update);
  }
};

const sendPoints = (data) => {
  console.log('Hash: ' + data.hash);
  canPass = false;
  highScore = myScore; // give the high score a base to start off at
  socket.emit('myScore', { myHash: hash, hash: data.hash, myScore: myScore, room: room, myNum: myNum });
};

//handle for key down events
const keyDownHandler = (e) => {
  let keyPressed = e.which;

  // W
  if(keyPressed === 87 || keyPressed === 38) {
    wDown = true;
    if(currentLetter === 'w'){
      correctPress = true;
    } else {
      console.log('hash: ' + hash);
      myScore = 0;
      socket.emit('fail', { room: room, hash: hash });
    }
  }
  // A
  else if(keyPressed === 65 || keyPressed === 37) {
    aDown = true;
    if(currentLetter === 'a'){
      correctPress = true;
    } else {
      console.log('hash: ' + hash);
      myScore = 0;
      socket.emit('fail', { room: room, hash: hash });
    }
  }
  // S
  else if(keyPressed === 83 || keyPressed === 40) {
    sDown = true;
    if(currentLetter === 's'){
      correctPress = true;
    } else {
      console.log('hash: ' + hash);
      myScore = 0;
      socket.emit('fail', { room: room, hash: hash });
    }
  }
  // D
  else if(keyPressed === 68 || keyPressed === 39) {
    dDown = true;
    if(currentLetter === 'd'){
      correctPress = true;
    } else {
      console.log('hash: ' + hash);
      myScore = 0;
      socket.emit('fail', { room: room, hash: hash });
    }
  }
  //tab key was pressed
  else if(keyPressed === 9) {
    if(potatoPossessor === myNum && canPass) {
      
      document.body.removeEventListener('keydown', keyDownHandler);
      document.body.removeEventListener('keyup', keyUpHandler);
      
      ctx.clearRect(0,0,CANVASWIDTH,CANVASHEIGHT);
      framesPassedSinceLetter = 0; // reset the frames to lose
      canPass = false;
      console.log('passing');
      socket.emit('pass', { room: room, hash: hash, myNum: myNum, });
    } else {
      console.log(potatoPossessor + " is the potatoPossessor, and I am " + myNum);
    }
    
  }
};

//handler for key up events
const keyUpHandler = (e) => {
  let keyPressed = e.which;

  // W OR UP
  if(keyPressed === 87 || keyPressed === 38) {
    wDown = false;
  }
  // A OR LEFT
  else if(keyPressed === 65 || keyPressed === 37) {
    aDown = false;
  }
  // S OR DOWN
  else if(keyPressed === 83 || keyPressed === 40) {
    sDown = false;
  }
  // D OR RIGHT
  else if(keyPressed === 68 || keyPressed === 39) {
    dDown = false;
  }
};




























