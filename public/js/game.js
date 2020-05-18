let log = console.log;

var config = {
  width:  800,
  height: 600,
  backgroundColor: 0x000000,
  scene: [MenuScene, GameScene],
  physics:{
    default: 'arcade',
    arcade:{
      
    }
  }
}
// var game = new Phaser.Game(800, 600, Phaser.AUTO, '', {preload, create, update,});
var game = new Phaser.Game(config);

var socket, land, player, enemies = [], speed = 0, prevPos;

function preload() {

}

function create() {


}
function update() {

}

