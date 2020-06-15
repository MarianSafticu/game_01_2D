const log = console.log;
const http = require('http');
const path = require('path');
const ecstatic = require('ecstatic');
const socketIo = require('socket.io');

let io;
const players = {};
const ammo_packs = {};
const bushes = []
const bushes_nr=20;
const medkits = {};
const server = http.createServer(ecstatic({root: path.resolve(__dirname, '../public')}))
  .listen(3000, () => {
    // create bushes
    initBushes()
    // initialize socket
    io = socketIo.listen(server);
    io.on('connection', client => {
      client.on('disconnect', () => onRemovePlayer(client));
      client.on('new player', (player) => onNewPlayer(client, player))
      client.on('move player', (player) => onMovePlayer(client, player));
      client.on('shoot', (data) => onPlayerShoot(client, data));
      client.on('drop ammo', (data)=>onDropAmmo(client,data));
      client.on('picked ammo', (data)=>onPickedAmmo(client, data));
      client.on('picked medkit', (data)=>onPickedMedkit(client, data));
      Object.keys(ammo_packs).forEach((x)=>{io.emit('new ammo pack',ammo_packs[x])})
      Object.keys(medkits).forEach((x)=>{io.emit('new medkit',medkits[x])})
      bushes.forEach(bush=>{io.emit('bush', bush)})
    })
    spawnAmmo(io);
    spawnMedkit(io);
  });

// remove player from list
const onRemovePlayer = client => {
  const removePlayer = players[client.id];
  if (!removePlayer) {
    return;
  }
  delete players[client.id];
  io.emit('remove player', removePlayer);
};

//player shoot
const onPlayerShoot = (ioClient, data) =>{
  io.emit('shoot', data)
}

//new player entered
const onNewPlayer = (ioClient, player) => {
  const newPlayer = new Player(player.x, player.y, player.angle);
  newPlayer.id = ioClient.id
  io.emit('new player', newPlayer);
  Object.getOwnPropertyNames(players).forEach(id => ioClient.emit('new player', players[id]));
  players[newPlayer.id] = newPlayer;
}

// spawn ammo packs every 8 seconds, to a maximum of 10 
function spawnAmmo(io){
  if(Object.keys(ammo_packs).length < 10){
    const newAmmo = new Ammo(Math.random()*1800 - 900,Math.random()*1800 - 900,parseInt(Math.random()*10)+1);
    newAmmo.id = Date.now();
    io.emit('new ammo pack', newAmmo);
    ammo_packs[newAmmo.id] = newAmmo;
  }
  setTimeout(()=>{spawnAmmo(io)},8000);
}

// spawn medkits every 15 seconds, to a maximum of 5 
function spawnMedkit(io){
  if(Object.keys(medkits).length < 5){
    const newMK = new Medkit(Math.random()*1800 - 900,Math.random()*1800 - 900);
    newMK.id = Date.now();
    io.emit('new medkit', newMK);
    medkits[newMK.id] = newMK;
  }
  setTimeout(()=>{spawnMedkit(io)},1500);
}

// distance between 2 points
function dist(x,y,x1,y1){
  return Math.sqrt((x-x1)*(x-x1) + (y-y1)*(y-y1));
}

// create bushes, where players can hide
function initBushes(){
  //create 
  for(let i=0;i<bushes_nr;i++){
    let x = Math.random()*1800 - 900;
    let y = Math.random()*1800 - 900;
    // the distance between 2 bushes should be at least 160px;
    while (bushes.map((bush)=>dist(x,y,bush.x,bush.y)).filter((v)=>v<160).length > 0){
      x = Math.random()*1800 - 900;
      y = Math.random()*1800 - 900;
    }
    bushes.push({x,y})
  }
}

// player moved
function onMovePlayer(ioClient, player) {
  const movePlayer = players[ioClient.id];
  if (!movePlayer) {
    return;
  }
  Object.assign(movePlayer, player);
  io.emit('move player', movePlayer);
}

// player droped ammo (when he died)
// spawn new ammopack with the rest of his amo
function onDropAmmo(ioClient, ammo){
  const newAmmo = new Ammo(ammo.x,ammo.y,ammo.ammo);
  newAmmo.id = Date.now();
  io.emit('new ammo pack', newAmmo);
  ammo_packs[newAmmo.id] = newAmmo;
}

// player picked ammo pack
function onPickedAmmo(ioClient, ammo){
  io.emit('picked ammo', ammo_packs[ammo.id])
  delete ammo_packs[ammo.id];
}

//player picked medkit
function onPickedMedkit(ioClient, medkit){
  io.emit('picked medkit', medkits[medkit.id])
  delete medkits[medkit.id];
}
class Ammo{
  constructor(x, y, no_bullets){
    this.x = x;
    this.y = y;
    this.nr = no_bullets;
    this.id = null;
  }
}
class Medkit{
  constructor(x, y){
    this.x = x;
    this.y = y;
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
