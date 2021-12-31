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

    create()
    {
        this.ballGroup = this.physics.add.group() // must be 'group' because of 'SetVelocity'
        this.skullGroup = this.physics.add.staticGroup()
        this.keyGroup = this.physics.add.staticGroup()

        this.activeBall = undefined
        this.levelLost = false

        console.log('reading levelindex', this.levelIndex)
        var level = LevelData[this.levelIndex]

        for (let i = 0; i < level.balls.length; i++) {
            let x = level.balls[i].x
            let y = level.balls[i].y
            let a = level.balls[i].a
            let ball = this.add.image(x, y, 'ball')
            this.ballGroup.add(ball)
            this.physics.moveTo(ball, x + Math.cos(a), y + Math.sin(a), 50)
            ball.body.setBounce(1)
            ball.body.setCollideWorldBounds(true)
            ball.body.setCircle(16)
        }

        for (let i = 0; i < level.keys.length; i++) {
            let key = this.add.image(level.keys[i].x, level.keys[i].y, 'key')
            this.keyGroup.add(key)
            key.body.setCircle(16)
        }

        for (let i = 0; i < level.skulls.length; i++) {
            let skull = this.add.image(level.skulls[i].x, level.skulls[i].y, 'skull')
            this.skullGroup.add(skull)
            skull.body.setCircle(16)
        }

        // we need at least one ball and one key
        if (this.ballGroup.getLength() == 0 || this.keyGroup.getLength() == 0) {
            alert('Error in level file for index: ' + this.levelIndex)
            this.sys.game.destroy(true)
        }

        this.lineObject = this.add.line(0, 0, 0, 0, 0, 0, 0xff0000)
        this.lineObject.setVisible(false)

        this.input.on("pointerdown", this.onMouseDown, this)
        this.input.on("pointerup", this.onMouseUp, this)

        this.physics.world.addCollider(this.ballGroup, this.ballGroup, this.onCollisionBall, null, this)
        this.physics.world.addCollider(this.ballGroup, this.skullGroup, this.onCollisionSkull, null, this)

        // we need overlap, otherweise the ball would bounce
        this.physics.world.addOverlap(this.ballGroup, this.keyGroup, this.onCollisionKey, null, this)
    }

    update()
    {
        if (this.keyGroup.getLength() == 0) {
            console.log('no more keys')
            if (this.levelIndex + 1 >= LevelData.length) {
                this.scene.start('victory')
                return
            }
            else {
                this.levelIndex++
                this.scene.restart()
                return
            }
        }

        if (this.levelLost) {
            console.log('level lost')
            this.scene.restart()
            return
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

        // TODO: try 'closest'
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
}