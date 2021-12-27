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
    }

    create()
    {
        this.add.image(400, 300, 'splash')
        this.scene.start('game')
    }
}
