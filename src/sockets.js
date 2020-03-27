// Credit to 590-Project2 by Aidan Kaufman and simple-server-collision by Cody Van De Mark
const xxh = require('xxhashjs');

let hashList = {};
// num to hold all of our connected users
const roomList = {};
let nextRoom = 0;
let currentRoomCount = 0;
let room;

let io;


const setupSockets = (ioServer) => {
  io = ioServer;

  io.on('connection', (sock) => {
    const socket = sock;

    socket.on('requestAccess', () => {
      // new user in this room
      currentRoomCount++;

      // send the user to their room
      socket.join(`room${nextRoom}`);
      room = `room${nextRoom}`;

      // if the room isn't in the roomList
      if (!roomList[`room${nextRoom}`]) {
        console.log(`adding room${nextRoom} to roomList`);
        roomList[`room${nextRoom}`] = {};
      }

      // generate the user's unique hash code
      const idString = `${socket.id}${new Date().getTime()}`;
      const hash = xxh.h32(idString, 0xCAFEBABE).toString(16);

      // socket.hash = hash; // is there a way to access this or is it a useless line?
      hashList[currentRoomCount] = hash;

      // send back that the players have joined with the list of hashes
      io.sockets.in(`room${nextRoom}`).emit('joined', {
        hash,
        room: `room${nextRoom}`,
        playerCount: currentRoomCount,
        primaryPotato: currentRoomCount,
      });

      if (!(currentRoomCount < 3)) {
        hashList = {};
        currentRoomCount = 0;
        nextRoom++;
      }
    });

    socket.on('pass', (data) => {
      let num = data.myNum;
      num++;
      if (num > 3) num = 1;

      console.log(`${num} is the currentPotatoPossessor`);
      io.sockets.in(data.room).emit('passingToNext', { hash: data.hash, next: num });
    });

    socket.on('fail', (data) => {
      console.log(`Hash: ${data.hash}`);
      io.sockets.in(data.room).emit('askPoints', { hash: data.hash });
    });

    socket.on('myScore', (data) => {
      io.sockets.in(data.room).emit('endingGame', { myHash: data.myHash, hash: data.hash, score: data.myScore, num: data.myNum });
    });

    // end the game when
    socket.on('disconnect', () => {
      io.sockets.in(room).emit('endingGame', { hash: null });
    });
  });
};

console.log('Websocket server started');


module.exports.setupSockets = setupSockets;

