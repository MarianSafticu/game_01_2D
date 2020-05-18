/* global game */

var RemotePlayer = function (index, game, player, startX, startY, startAngle, scene) {
  var x = startX
  var y = startY
  var angle = startAngle

  this.scene = scene;
  this.game = game
  this.health = 100
  this.player = player
  this.alive = true

  this.player = scene.add.sprite(x, y, 'dude')

  this.player.name = index.toString()
  // game.physics.enable(this.player, Phaser.Physics.ARCADE)
  // this.player.body.immovable = true
  // this.player.body.collideWorldBounds = true

  this.player.angle = angle

  this.lastPosition = { x: x, y: y, angle: angle }
}

RemotePlayer.prototype.update = function () {
  if(this.alive){
    if (this.player.x != this.lastPosition.x || this.player.y != this.lastPosition.y) {
      if(!this.move){

        this.player.anims.play("move")
      }
      this.move = true;
      // this.player.rotation = this.player.angle
    } else {
      this.player.anims.play('stop');
      this.move = false;
    }

    this.lastPosition.x = this.player.x
    this.lastPosition.y = this.player.y
    this.lastPosition.angle = this.player.angle
  }
}

window.RemotePlayer = RemotePlayer
