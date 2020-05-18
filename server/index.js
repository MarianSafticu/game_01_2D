const log = console.log;
const http = require('http');
const path = require('path');
const ecstatic = require('ecstatic');
const socketIo = require('socket.io');

let io;
const players = {};
const ammo_packs = {};

const server = http.createServer(ecstatic({root: path.resolve(__dirname, '../public')}))
  .listen(3000, () => {
    io = socketIo.listen(server);
    io.on('connection', client => {
      client.on('disconnect', () => onRemovePlayer(client));
      client.on('new player', (player) => onNewPlayer(client, player))
      client.on('move player', (player) => onMovePlayer(client, player));
      client.on('shoot', (data) => onPlayerShoot(client, data));
      client.on('drop ammo', (data)=>onDropAmmo(client,data));
      client.on('picked ammo', (data)=>onPickedAmmo(client, data));
      Object.keys(ammo_packs).forEach((x)=>{io.emit('new ammo pack',ammo_packs[x])})
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
const onPlayerShoot = (ioClient, data) =>{
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
function onDropAmmo(ioClient, ammo){
  const newAmmo = new Ammo(ammo.x,ammo.y,ammo.ammo);
  newAmmo.id = Date.now();
  io.emit('new ammo pack', newAmmo);
  ammo_packs[newAmmo.id] = newAmmo;
}
function onPickedAmmo(ioClient, ammo){
  io.emit('picked ammo', ammo_packs[ammo.id])
  delete ammo_packs[ammo.id];
}
class Ammo{
  constructor(x, y, no_bullets){
    this.x = x;
    this.y = y;
    this.nr = no_bullets;
    this.id = null;
  }
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
