import Phaser from 'phaser'

export default class VictoryScene extends Phaser.Scene
{
    constructor()
    {
        super('victory')
    }

    create()
    {
        this.add.image(400, 300, 'victory')
        this.cameras.main.fadeIn(2000, 0, 0, 0)
    }
}
