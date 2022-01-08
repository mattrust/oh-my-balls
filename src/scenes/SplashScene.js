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
        this.load.image('victory', 'assets/victory.png')

        this.load.image('ball', 'assets/ball.png')
        this.load.image('key', 'assets/key.png')
        this.load.image('skull', 'assets/skull.png')
        
        this.load.spritesheet('explosion', 'assets/explosion.png',  { frameWidth: 64, frameHeight: 64 })
    }

    create()
    {
        this.add.image(400, 300, 'splash')
        this.input.once('pointerup', function(/** @type {Phaser.Input.Pointer} */ pointer) {
            this.cameras.main.fadeOut(2000, 0, 0, 0)
        }, this)

        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, (cam, effect) => {
            this.scene.start('game')
        })
    }
}
