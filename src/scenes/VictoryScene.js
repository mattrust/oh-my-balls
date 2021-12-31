import Phaser from 'phaser'

export default class VictoryScene extends Phaser.Scene
{
    constructor()
    {
        super('victory')
    }

    create()
    {
        this.add.image(400, 300, 'splash') // TODO: create image
    }
}
