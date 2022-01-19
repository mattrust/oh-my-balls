import Phaser from 'phaser'

const formatLevelNr = (levelNr) => `Level: ${levelNr}`

export default class TitleBar
{
    constructor(scene)
    {
        this.scene = scene

        this.levelNrText = this.scene.add.text(16, 0, 'Level: 0', {fontSize: '32px'})
        this.scene.add.image(700, 16, 'key')
        this.keyNrText = this.scene.add.text(730, 0, '5', {fontSize: '32px'})
    }

    /**
     * @param {integer} levelNr
     */
    setLevelNr(levelNr)
    {
        this.levelNrText.setText(formatLevelNr(levelNr + 1))
    }

    /**
     * @param {integer} keyNr
     */
     setKeyNr(keyNr)
     {
         this.keyNrText.setText(keyNr)
     }
}
