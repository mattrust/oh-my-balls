import Phaser from 'phaser'
import LevelData from '../levels/Default'

export default class GameScene extends Phaser.Scene
{
    constructor()
    {
        super('game')
        this.ballGroup = undefined
        this.skullGroup = undefined
        this.keyGroup = undefined
        this.activeBall = undefined
        this.lineObject = undefined
        this.levelIndex = 0
        this.levelLost = false
    }

    preload()
    {
        this.load.image('ball', 'assets/ball.png')
        this.load.image('key', 'assets/key.png')
        this.load.image('skull', 'assets/skull.png')
     }

    create()
    {
        this.ballGroup = this.physics.add.group() // must be 'group' because of 'SetVelocity'
        this.skullGroup = this.physics.add.staticGroup()
        this.keyGroup = this.physics.add.staticGroup()

        this.reloadLevel()
    }

    update()
    {
        if (this.keyGroup.children.size == 0) {
            this.levelIndex++
            if (this.levelIndex > LevelData.length)
            {
                console.log('game won')
                return
            }
            this.reloadLevel()
        }

        if (this.levelLost)
        {
            this.reloadLevel()
        }

        var pointer = this.input.activePointer;
        if (pointer.isDown && this.activeBall) {
            this.lineObject.setTo(this.activeBall.x, this.activeBall.y, pointer.x, pointer.y)
        }
    }

    /**
     * @param {Phaser.Input.Pointer} pointer
     */
    onMouseDown(pointer)
    {
        var minDistance = 1000000
        var activeBall = undefined

        this.ballGroup.children.each(function(ball) {
            var distance = Phaser.Math.Distance.Between(pointer.x, pointer.y, ball.body.gameObject.x, ball.body.gameObject.y)
            if (distance < minDistance) {
                minDistance = distance
                activeBall = ball
            }
        })
        this.activeBall = activeBall
        this.lineObject.setVisible(true)
    }

    /**
     * @param {Phaser.Input.Pointer} pointer
     */
    onMouseUp(pointer)
    {
        if (this.activeBall) {
            this.physics.moveToObject(this.activeBall, pointer, 50)
            this.activeBall = undefined
        }
        this.lineObject.setVisible(false)
    }

    /**
     * @param {Phaser.GameObjects.GameObject} ball1
     * @param {Phaser.GameObjects.GameObject} ball2
     */
    onCollisionBall(ball1, ball2)
    {
        ball1.destroy()
        ball2.destroy()
        this.levelLost = true
    }

    /**
     * @param {Phaser.GameObjects.GameObject} ball
     * @param {Phaser.GameObjects.GameObject} skull
     */
    onCollisionSkull(ball, skull)
    {
        ball.destroy()
        this.levelLost = true
    }

    /**
     * @param {Phaser.GameObjects.GameObject} ball
     * @param {Phaser.GameObjects.GameObject} key
     */
    onCollisionKey(ball, key)
    {
        key.destroy()
    }

    reloadLevel()
    {
        this.ballGroup.clear(true, true)
        this.keyGroup.clear(true, true)
        this.skullGroup.clear(true, true)

        this.activeBall = undefined
        
        var level = LevelData[this.levelIndex]

        for (let i = 0; i < level.balls.length; i++) {
            this.ballGroup.create(level.balls[i][0], level.balls[i][1], 'ball')
        }

        for (let i = 0; i < level.keys.length; i++) {
            this.keyGroup.create(level.keys[i][0], level.keys[i][1], 'key')
        }

        for (let i = 0; i < level.skulls.length; i++) {
            this.skullGroup.create(level.skulls[i][0], level.skulls[i][1], 'skull')
        }

        this.ballGroup.setVelocity(50, 0)
        this.ballGroup.children.each(function(ball) {
            ball.body.gameObject.setCircle(16)
        }, this)

        this.skullGroup.children.each(function(skull) {
                skull.body.gameObject.setCircle(16)
        }, this)

        this.keyGroup.children.each(function(key) {
                key.body.gameObject.setCircle(16)
        }, this)

        this.lineObject = this.add.line(0, 0, 0, 0, 0, 0, 0xff0000)
        this.lineObject.setVisible(false)

        this.input.on("pointerdown", this.onMouseDown, this)
        this.input.on("pointerup", this.onMouseUp, this)

        this.physics.world.addCollider(this.ballGroup, this.ballGroup, this.onCollisionBall, null, this)
        this.physics.world.addCollider(this.ballGroup, this.skullGroup, this.onCollisionSkull, null, this)

        // we need overlap, otherweise the ball would bounce
        this.physics.world.addOverlap(this.ballGroup, this.keyGroup, this.onCollisionKey, null, this)
    }
}
