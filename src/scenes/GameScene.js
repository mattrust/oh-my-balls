import Phaser from 'phaser'

export default class GameScene extends Phaser.Scene
{
	constructor()
	{
		super('game')
		this.ballgroup = undefined
		this.skullgroup = undefined
		this.keygroup = undefined
		this.currentBall = undefined
		this.line = undefined
	}

	preload()
    {
        this.load.image('ball', 'assets/ball.png')
        this.load.image('key', 'assets/key.png')
        this.load.image('skull', 'assets/skull.png')
     }

	create()
	{
		this.ballgroup = this.physics.add.group()
		this.ballgroup.create(100, 100, 'ball')
		this.ballgroup.create(100, 200, 'ball')
		this.ballgroup.create(100, 300, 'ball')
		this.ballgroup.create(100, 400, 'ball')
		this.ballgroup.create(100, 500, 'ball')
		
		this.ballgroup.setVelocity(50, 0)
		this.ballgroup.children.each(function(ball) {
			ball.body.gameObject.setCircle(16)
		}, this)

		this.skullgroup = this.physics.add.staticGroup()
		this.skullgroup.create(500, 150, 'skull')
		this.skullgroup.create(500, 350, 'skull')
		this.skullgroup.children.each(function(skull) {
			skull.body.gameObject.setCircle(16)
		}, this)

		this.keygroup = this.physics.add.staticGroup()
		this.keygroup.create(400, 250, 'key')
		this.keygroup.create(400, 450, 'key')
		this.keygroup.children.each(function(key) {
			key.body.gameObject.setCircle(16)
		}, this)

		this.line = this.add.line(0, 0, 0, 0, 0, 0, 0xff0000)
		this.line.setVisible(false)

		this.input.on("pointerdown", this.onMouseDown, this)
		this.input.on("pointerup", this.onMouseUp, this)

		this.physics.world.setBounds(0, 50, 800, 550)
		this.physics.world.addCollider(this.ballgroup, this.ballgroup, this.onCollisionBall)
		this.physics.world.addCollider(this.ballgroup, this.skullgroup, this.onCollisionSkull)
		this.physics.world.addCollider(this.ballgroup, this.keygroup, this.onCollisionKey)
	}

	update()
	{
		var pointer = this.input.activePointer;
		if (pointer.isDown && this.currentBall) {	
			this.line.setTo(this.currentBall.x, this.currentBall.y, pointer.x,pointer.y)
		}
	}

	onMouseDown(pointer)
	{
		var minDistance = 1000000
		var currentBall = undefined

		this.ballgroup.children.each(function(ball) {
			var distance = Phaser.Math.Distance.Between(pointer.x, pointer.y, ball.body.gameObject.x, ball.body.gameObject.y)
			if (distance < minDistance) {
				minDistance = distance
				currentBall = ball
			}
		})
		this.currentBall = currentBall
		this.line.setVisible(true)
	}

	onMouseUp(pointer)
	{
		if (this.currentBall) {
			this.physics.moveToObject(this.currentBall, pointer, 50)
			this.currentBall = undefined
		}
		this.line.setVisible(false)
	}

	onCollisionBall(ball1, ball2)
	{
		ball1.destroy()
		ball2.destroy()
	}
	
	onCollisionSkull(ball, skull)
	{
		ball.destroy()
	}

	onCollisionKey(ball, key)
	{
		key.destroy()
	}
}
