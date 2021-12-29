import Phaser from 'phaser'

import SplashScene from './scenes/SplashScene'
import GameScene from './scenes/GameScene'

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade'
    },
    scene: [SplashScene, GameScene]
}

export default new Phaser.Game(config)
