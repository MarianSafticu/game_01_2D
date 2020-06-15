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
        this.add.text(10,550,'W,A,S,D to move; click to shoot;\nthe shoot is in direction of the pointer' + game.score,{fontFamily:'Stencil',fontSize:25,color:'#fff'})
        if (game.score){
            this.add.text(170,100,'Your score was ' + game.score,{fontFamily:'Stencil',fontSize:50,color:'#f00'}) 
        }
    }
    startGame(){
        game.scene.start("gameScene")
        game.scene.stop("mainMenu")
    }
    // start game when player click on play
    onObjectClicked(gameObject, pointer){
        log(gameObject)
        if (gameObject == this.play_b){
            this.startGame();
        }
    }

}