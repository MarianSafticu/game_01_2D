const maxAmmo = 30; 
const areea_shoot = 200;
class GameScene extends Phaser.Scene{
    constructor(){
        super("gameScene")
        this.enemies = [];
        this.ammo_packs = {};
        let that = this;
        
        this.keys = {}
        this.walk = false;
        this.last_anime = false;
        this.reset_character()
    }
    reset_character(){
        this.speed = 100;
        this.ammo = 30;
        this.damage =10;
        this.health = 100;
        this.alive = true;
        this.x = 0;
        this.y = 0;
        this.angle = 0;
        this.score = 0;
    }
    preload(){
        this.load.image('earth', 'assets/light_sand.png')
        this.load.image('ammo', 'assets/ammo.png')
        this.load.spritesheet('dude', 'assets/dude.png', {frameWidth: 64, frameHeight:64})
        this.load.spritesheet('soldier', 'assets/soldier.png', {frameWidth: 64, frameHeight:64})
        // this.load.spritesheet('enemy', 'assets/dude.png')
    }
    create(){

        // set event handlers
        log('create game');
        this.reset_character()
        // create land
        land = this.add.tileSprite(0, 0, 2000, 2000, 'earth');
        this.physics.world.bounds.setTo(-1000,-1000,2000,2000)
        this.physics.world.setBoundsCollision();
        // land.fixedToCamera = true;
        // create player
        this.x = 400;
        this.y = 300;

        this.camera = this.cameras.main;
        
        this.prevPos = {x:this.x, y:this.y};
        player = this.physics.add.sprite(this.x, this.y, 'dude');
        
        this.player = player;
        this.player.setCollideWorldBounds(true);
        this.player.onWorldBounds = true;
        this.camera.startFollow(this.player);
        this.physics.start()
        
        // console.log(player)
        // player.anchor.setTo(0.5, 0.5);
        this.anims.create({
            key: 'move',
            frames: this.anims.generateFrameNumbers('soldier', { start: 0, end: 19 }),
            frameRate: 20,
            repeat: -1,
        })
        this.anims.create({
            key: 'stop',
            frames: this.anims.generateFrameNumbers('soldier', { start: 3, end: 3 }),
            frameRate: 5,
            repeat: -1,
        })
        this.anims.create({
            key: 'shoot',
            frames: this.anims.generateFrameNumbers('soldier', { start: 20, end: 22 }),
            frameRate: 30,
            repeat: 0,
        })


        this.health_text = this.add.text(10,10,'Health: 100',{fontFamily:'Stencil',fontSize:25,color:'#b00'}) 
        this.health_text.setScrollFactor(0,0)
        this.ammo_text = this.add.text(670,560,'Ammo: 30',{fontFamily:'Stencil',fontSize:25,color:'#555'}) 
        this.ammo_text.setScrollFactor(0,0)
        this.score_text = this.add.text(650,10,'Score: 0',{fontFamily:'Stencil',fontSize:25,color:'#555'}) 
        this.score_text.setScrollFactor(0,0)

        this.keys.w = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.keys.a = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keys.s = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.keys.d = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        let that = this;
        
        var socket = io.connect();
        this.socket = socket;
        this.socket.on('connect', ()=>{that.onSocketConnected()});
        this.socket.on('disconnect', ()=>{that.onSocketDisconnect()});
        this.socket.on('new player', (data)=>{that.onNewPlayer(data)});
        this.socket.on('move player', (data)=>{that.onMovePlayer(data)});
        this.socket.on('remove player', (data) => {that.onRemovePlayer(data)});
        this.socket.on('new ammo pack', (data)=>{that.onNewAmmoPack(data)})
        this.socket.on('picked ammo', (data)=>{that.onPickedAmmo(data)})
        this.socket.on('shoot', (data) =>{that.onShoot(data)})
        log(this.socket)
        land.setInteractive().on('pointerdown', (pointer, localX,localY,event)=>{
            if(this.ammo > 0){
                this.player.anims.play('shoot');
                let x = localX - 1000
                let y = localY - 1000
                let damage = this.damage
                this.ammo-=1;
                this.ammo_text.setText("Ammo: "+ this.ammo)
                let angle_weapon = Phaser.Math.Angle.Between(that.player.x, that.player.y, pointer.x + this.cameras.main.scrollX, pointer.y + this.cameras.main.scrollY );
                this.socket.emit('shoot', {x: this.player.x,y:this.player.y,angle_weapon,damage, id: this.id})
                
                for (let p of this.enemies){
                    let dist = Phaser.Math.Distance.Between(p.player.x,p.player.y, x, y);
                    let angle =  Phaser.Math.Angle.Between(that.player.x, that.player.y, p.x + this.cameras.main.scrollX, p.y + this.cameras.main.scrollY );
                    if(dist < areea_shoot && Math.abs(angle-angle_weapon)<3){
                        that.score += 10;
                    }
                }
                this.score_text.setText("Score: "+this.score)
            }
        })
        this.input.on('pointermove', (pointer)=>{
            let angle = Phaser.Math.Angle.Between(that.player.x, that.player.y, pointer.x + this.cameras.main.scrollX, pointer.y + this.cameras.main.scrollY )
            angle = angle*180/Math.PI;
            that.player.angle = angle;
            that.socket.emit('move player',{x: that.player.x, y: that.player.y, angle: that.player.angle})
        })

    }
    update(){
        if(this.alive){
            
            
            // this.player.anims.play('stop')
            this.enemies.forEach(x=>x.update())
            this.walk = false;
            let x=0,y=0;
            if(this.keys.w.isDown) {y -= 1;this.walk = true}
            if(this.keys.a.isDown) {x -= 1;this.walk = true}
            if(this.keys.s.isDown) {y += 1;this.walk = true}
            if(this.keys.d.isDown) {x += 1;this.walk = true}
            // this.changeAngle(x,y);
            this.player.setVelocityX(this.speed*x);
            this.player.setVelocityY(this.speed*y);
            // if(this.walk) log(this.enemies)
            if (this.x != this.player.x || this.y != this.player.y) {
                this.socket.emit('move player',{x: this.player.x, y: this.player.y, angle: this.player.angle})
                if (!this.last_anime){
                    this.player.anims.play('move')
                    this.last_anime = true;
                }
                this.x = this.player.x;
                this.y = this.player.y;
            }else{
                this.last_anime = false;
                this.player.anims.play('stop')
            }
        }
    }
    changeAngle(x,y){
        if (x == -1 && y == 0){
            this.player.angle = 180; 
        }else if (x == -1 && y == -1){
            this.player.angle = 225;
        }else if (x == -1 && y == 1){
            this.player.angle = 135;
        }else if (x == 1 && y == 0){
            this.player.angle = 0; 
        }else if (x == 1 && y == -1){
            this.player.angle = -45;
        }else if (x == 1 && y == 1){
            this.player.angle = 45;
        }else if (x == 0 && y == 1){
            this.player.angle = 90;
        }else if (x == 0 && y == -1){
            this.player.angle = -90;
        }
    }
    
    onSocketConnected() {
        log('connected to server');
        this.enemies.forEach(enemy => enemy.player.destroy());
        this.enemies = [];
        this.socket.emit('new player', {x: 400, y: 300, angle: 0});
        this.id = this.socket.id;
    }
      
    onSocketDisconnect() {
    }
      
    onNewPlayer(data) {
        var duplicate = this.playerById(data.id);
        if (duplicate) { 
          return;
        }
        if(data.id == this.id){
            return;
        }
        this.enemies.push(new RemotePlayer(data.id, game, player, data.x, data.y, data.angle,this));
    }
      
    onMovePlayer(data) {
        let movePlayer = this.playerById(data.id);
        if (!movePlayer) {
            return;
        }
        movePlayer.player.x = data.x;
        movePlayer.player.y = data.y;
        movePlayer.player.angle = data.angle;
    }
      
    onRemovePlayer(data) {
        log("remove : "+data.id)
        let removePlayer = this.playerById(data.id);
        if (!removePlayer) {
          return;
        }
        removePlayer.alive = false;
        removePlayer.player.destroy()
        this.enemies.splice(this.enemies.indexOf(removePlayer), 1); 
    }
      
    playerById(id) {
        for (let p of this.enemies){
          if (p.player.name == id) return p;
        }
        return false;
    }
    onShoot(data){
        let x = data.x
        let y = data.y
        log("shoot");
        if(data.id == this.id) return;
        let angle = Phaser.Math.Angle.Between(x,y, this.player.x + this.cameras.main.scrollX, this.player.y + this.cameras.main.scrollY )
        log(angle);
        log(Math.abs(angle-data.angle))
        if(Phaser.Math.Distance.Between(x,y, this.player.x, this.player.y) < areea_shoot && Math.abs(angle-data.angle)<0.4){
            this.health -= data.damage;
            this.health_text.setText('Health: '+ this.health)
            if(this.health <= 0){
                this.socket.emit("drop ammo", {x:this.player.x,y:this.player.y,ammo:this.ammo})
                this.socket.disconnect(true)
                
                this.alive = false;
                this.enemies.forEach(enemy => enemy.player.destroy());
                this.enemies = [];
                // this.socket.emit('new player', {x: 400, y: 300, angle: 0});
                game.scene.start("mainMenu")
                game.scene.stop("gameScene")
                this.alive = true;
            }
        }
    }
    onNewAmmoPack(ammo){
        this.ammo_packs[ammo.id] = ammo;
        let ammo_pack = this.physics.add.sprite(ammo.x-32, ammo.y-32, 'ammo');
        this.ammo_packs[ammo.id].body = ammo_pack;
        ammo_pack.size = ammo.nr;
        ammo_pack.id = ammo.id;
        this.physics.add.overlap(this.player, ammo_pack, this.pickAmmo, null, this);
    }

    pickAmmo(player, ammo){
        if(this.ammo < maxAmmo){
            this.socket.emit("picked ammo",{id: ammo.id} )
            this.ammo = Math.min(this.ammo + ammo.size, maxAmmo);
            this.ammo_text.setText("Ammo: "+ this.ammo)
            ammo.disableBody(true,true);
            ammo.destroy();
        }
    }
    onPickedAmmo(ammo){
        let aux = this.ammo_packs[ammo.id];
        aux.body.disableBody(true,true);
        aux.body.destroy();
        delete this.ammo_packs[ammo.id];
    }
}