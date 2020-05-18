class MenuScene extends Phaser.Scene{
    constructor(){
        super("mainMenu")
    }
    preload(){
        this.load.image('menu', 'assets/menu_bg.jpg')
        this.load.image('play', 'assets/play_button.png')
    }
    create(){
        this.add.sprite(400,300,'menu')
        this.play_b = this.add.sprite(400,300,'play').setInteractive();
        this.w = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.play_b.on('pointerdown',this.startGame);
        this.play = false;
    }
    update(){
        // if(this.w.isDown && !this.play){
        //     // game.scene.scenes[1].restart_game()
        //     this.startGame();
        //     this.play = true;
        // }
    }

    resetGame(){
        // game.scene.scenes[1].scene.restart()
        
    }
    startGame(){
        game.scene.start("gameScene")
        game.scene.stop("mainMenu")
    }
    onObjectClicked(gameObject, pointer){
        log(gameObject)
        if (gameObject == this.play_b){
            this.startGame();
        }
    }

}