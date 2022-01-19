import Phaser from 'phaser'
import LevelData from '../levels/Default'
import TitleBar from '../ui/titlebar'

export default class GameScene extends Phaser.Scene
{
    constructor()
    {
        super('game')

        // index of current level. Must be initialized here so that we can increment
        // it when we restart the scene
        this.levelIndex = 0
    }

    init()
    {
        this.ballGroup = undefined // sprite group for balls
        this.skullGroup = undefined // sprite group for skulls
        this.keyGroup = undefined // sprite group for keys
        this.bouncerGroup = undefined // sprite group for bouncers
        this.activeBall = undefined // reference to the selected ball
        this.lineObject = undefined // line object between selected ball and mouse pointer
        this.titleBar = undefined // title bar with status information
        this.levelLost = false // level has been lost after a collision
        this.isRunning = false // set this to false when bailing out
        this.ballSpeed = 70 // generic ball speed
    }

    create()
    {
        this.isRunning = false

        this.ballGroup = this.physics.add.group() // must be 'group' because of 'SetVelocity'
        this.bouncerGroup = this.physics.add.staticGroup()
        this.skullGroup = this.physics.add.staticGroup()
        this.keyGroup = this.physics.add.staticGroup()

        this.activeBall = undefined
        this.levelLost = false

        console.log('reading levelindex', this.levelIndex)
        const level = LevelData[this.levelIndex]

        // read ball parameters from level file
        for (let i = 0; i < level.balls.length; i++) {
            let x = level.balls[i].x
            let y = level.balls[i].y
            let a = level.balls[i].a
            let ball = this.add.sprite(x, y, 'ball') // must be sprite because of expl. animation
            this.ballGroup.add(ball)
            this.physics.moveTo(ball, x + Math.cos(a), y + Math.sin(a), this.ballSpeed)
            ball.body.setBounce(1)
            ball.body.setCollideWorldBounds(true)
            ball.body.setCircle(16)
        }

        // read bouncer parameters from level file
        for (let i = 0; i < level.bouncers.length; i++) {
            let bouncer = this.add.sprite(level.bouncers[i].x, level.bouncers[i].y, 'bouncer')
            this.bouncerGroup.add(bouncer)
            //bouncer.body.setBounce(1)
            bouncer.body.setCircle(16)
        }
    
        // read key parameters from level file
        for (let i = 0; i < level.keys.length; i++) {
            let key = this.add.image(level.keys[i].x, level.keys[i].y, 'key')
            this.keyGroup.add(key)
            key.body.setCircle(16)
        }

        // read skull parameters from level file
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

        // create animation
        this.anims.create({
            key: 'explosion',
            frames: this.anims.generateFrameNumbers('explosion', { start: 0, end: 15 }),
            frameRate: 15,
            repeat: 0
        })

        // create title bar
        this.titleBar = new TitleBar(this)
        this.titleBar.setKeyNr(this.keyGroup.getLength())
        this.titleBar.setLevelNr(this.levelIndex)

        // create line object
        this.lineObject = this.add.line(0, 0, 0, 0, 0, 0, 0xff0000)
        this.lineObject.setVisible(false)

        // install pointerup/down event handlers
        this.input.on("pointerdown", this.onMouseDown, this)
        this.input.on("pointerup", this.onMouseUp, this)

        // install collider callbacks
        this.physics.world.addCollider(this.ballGroup, this.ballGroup, this.onCollisionBall, null, this)
        this.physics.world.addCollider(this.ballGroup, this.bouncerGroup, this.onCollisionBouncer, null, this)
        this.physics.world.addCollider(this.ballGroup, this.skullGroup, this.onCollisionSkull, null, this)

        // we need overlap, otherweise the ball would bounce
        this.physics.world.addOverlap(this.ballGroup, this.keyGroup, this.onCollisionKey, null, this)

        // set world limits so that the balls don't run into the title bar
        this.physics.world.setBounds(0, 32, 800, 568)

        this.cameras.main.fadeIn(2000, 0, 0, 0)

        this.isRunning = true
    }

    update()
    {
        if (!this.isRunning) return // just show explosion animation and fade-out

        // check for number of uncollected keys
        if (this.keyGroup.getLength() == 0) {
            console.log('no more keys')
            // do we have the last entry in the level file?
            if (this.levelIndex + 1 >= LevelData.length) {
                this.bailOut(true)
                return
            }
            else {
                // restart with next level file
                this.levelIndex++
                this.bailOut(false)
                return
            }
        }

        // we have lost this level because of a crash
        if (this.levelLost) {
            console.log('level lost')
            this.bailOut(false)
            return
        }

        // draw a line between active ball and mouse pointer
        const pointer = this.input.activePointer
        if (pointer.isDown && this.activeBall) {
            this.lineObject.setTo(this.activeBall.x, this.activeBall.y, pointer.x, pointer.y)
        }
        else {
            this.activeBall = undefined
            this.lineObject.setVisible(false)
        }
    }

    /**
     * @param {Phaser.Input.Pointer} pointer
     */
    onMouseDown(pointer)
    {
        if (!this.isRunning) return

        let minDistance = 1000000
        let activeBall = undefined

        // TODO: try 'closest'
        this.ballGroup.children.each(function(ball) {
            let distance = Phaser.Math.Distance.Between(pointer.x, pointer.y, ball.body.gameObject.x, ball.body.gameObject.y)
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
        if (!this.isRunning) return

        if (this.activeBall) {
            this.physics.moveToObject(this.activeBall, pointer, this.ballSpeed)
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
        if (!this.isRunning) return

        ball1.play('explosion')
        ball2.play('explosion')
        this.levelLost = true
    }

    /**
     * @param {Phaser.GameObjects.GameObject} ball
     * @param {Phaser.GameObjects.GameObject} bouncer
     */
    onCollisionBouncer(ball, bouncer)
    {
        if (!this.isRunning) return
        // TODO: play a sample
    }

    /**
     * @param {Phaser.GameObjects.GameObject} ball
     * @param {Phaser.GameObjects.GameObject} skull
     */
    onCollisionSkull(ball, skull)
    {
        if (!this.isRunning) return

        ball.play('explosion')
        this.levelLost = true
    }

    /**
     * @param {Phaser.GameObjects.GameObject} ball
     * @param {Phaser.GameObjects.GameObject} key
     */
    onCollisionKey(ball, key)
    {
        if (!this.isRunning) return

        key.destroy()
        this.titleBar.setKeyNr(this.keyGroup.getLength())
    }

    /**
     * @param {boolean} victory - If true switch to the Victory scene, otherwise restart the scene.
     */
    bailOut(victory)
    {
        this.isRunning = false
        this.ballGroup.setVelocity(0, 0) // stop all balls
        this.cameras.main.fadeOut(2000, 0, 0, 0)
        this.activeBall = undefined
        this.lineObject.setVisible(false)
        if (victory)
        {
            this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, (cam, effect) => {
                this.scene.start('victory')
            })
        }
        else {
            this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, (cam, effect) => {
                this.scene.restart()
            })
        }
    }
}
