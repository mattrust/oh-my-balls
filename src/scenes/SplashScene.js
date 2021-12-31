import Phaser from 'phaser'

export default class SplashScene extends Phaser.Scene
{
    constructor()
    {
        super('splash')
    }

    preload()
    {
        this.load.image('splash', 'assets/splash.png')

        this.load.image('ball', 'assets/ball.png')
        this.load.image('key', 'assets/key.png')
        this.load.image('skull', 'assets/skull.png')
    }

    create()
    {
        this.add.image(400, 300, 'splash')
        this.input.once('pointerup', function(/** @type {Phaser.Input.Pointer} */ pointer) {
            this.scene.start('game')
        }, this)
    }
}
