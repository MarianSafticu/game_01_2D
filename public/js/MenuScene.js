class MenuScene extends Phaser.Scene{
    constructor(){
        super("mainMenu")
    }
    create(){
        this.w = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.play = false;
    }
    update(){
        if(this.w.isDown && !this.play){
            // game.scene.scenes[1].restart_game()
            game.scene.start("gameScene")
            this.play = true;
        }
    }

    resetGame(){
        // game.scene.scenes[1].scene.restart()
        
    }

}