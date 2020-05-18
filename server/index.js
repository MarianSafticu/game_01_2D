const log = console.log;
const http = require('http');
const path = require('path');
const ecstatic = require('ecstatic');
const socketIo = require('socket.io');

let io;
const players = {};

const server = http.createServer(ecstatic({root: path.resolve(__dirname, '../public')}))
  .listen(3000, () => {
    io = socketIo.listen(server);
    io.on('connection', client => {
      client.on('disconnect', () => onRemovePlayer(client));
      client.on('new player', (player) => onNewPlayer(client, player))
      client.on('move player', (player) => onMovePlayer(client, player));
      client.on('shoot', (data) => onPlayerShoot(client, data));
    })
  });

const onRemovePlayer = client => {
  const removePlayer = players[client.id];
  if (!removePlayer) {
    return;
  }
  delete players[client.id];
  io.emit('remove player', removePlayer);
};
const onPlayerShoot = (ioClient, player) =>{
  data = {id: ioClient.id, ...player}
  io.emit('shoot', data)
}

const onNewPlayer = (ioClient, player) => {
  const newPlayer = new Player(player.x, player.y, player.angle);
  newPlayer.id = ioClient.id
  io.emit('new player', newPlayer);
  Object.getOwnPropertyNames(players).forEach(id => ioClient.emit('new player', players[id]));
  players[newPlayer.id] = newPlayer;
}

function onMovePlayer(ioClient, player) {
  const movePlayer = players[ioClient.id];
  if (!movePlayer) {
    return;
  }
  Object.assign(movePlayer, player);
  io.emit('move player', movePlayer);
}

class Player {
  constructor(startX, startY, startAngle) {
    this.x = startX;
    this.y = startY;
    this.angle = startAngle;
    this.health = 100;
    this.armour = 0;
    this.ammo = 0;
    this.weapon = null;
  }
}
