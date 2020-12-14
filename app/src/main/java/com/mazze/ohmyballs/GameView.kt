package com.mazze.ohmyballs

import android.content.Context
import android.graphics.BitmapFactory
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.util.AttributeSet
import android.view.MotionEvent
import android.view.SurfaceHolder
import android.view.SurfaceView

class GameView(context: Context, attributes: AttributeSet) : SurfaceView(context, attributes), SurfaceHolder.Callback {
    private val thread: GameThread

    private var skull: Sprite? = null
    private var ball: Sprite? = null
    private var ball_hl: Sprite? = null
    private var key: Sprite? = null

    private var touched: Boolean = false
    private var touched_x: Int = 0
    private var touched_y: Int = 0

    init {
        holder.addCallback(this)
        thread = GameThread(holder, this)
    }

    override fun surfaceCreated(surfaceHolder: SurfaceHolder) {
        // game objects
        skull = Sprite(BitmapFactory.decodeResource(resources, R.drawable.skull), 100, 500)
        ball = Sprite(BitmapFactory.decodeResource(resources, R.drawable.ball), 200, 600)
        ball_hl = Sprite(BitmapFactory.decodeResource(resources, R.drawable.ball_hl), 300, 700)
        key = Sprite(BitmapFactory.decodeResource(resources, R.drawable.key), 400, 800)

        // start the game thread
        thread.setRunning(true)
        thread.start()
    }

    override fun surfaceChanged(surfaceHolder: SurfaceHolder, i: Int, i1: Int, i2: Int) {

    }

    override fun surfaceDestroyed(surfaceHolder: SurfaceHolder) {
        var retry = true
        while (retry) {
            try {
                thread.setRunning(false)
                thread.join()
            } catch (e: Exception) {
                e.printStackTrace()
            }

            retry = false
        }
    }

    /**
     * Function to update the positions of sprites
     */
    fun update() {
        skull!!.update()
        ball!!.update()
        ball_hl!!.update()
        key!!.update()
/*
        if(touched) {
            player!!.updateTouch(touched_x, touched_y)
        }
*/
    }

    /**
     * Everything that has to be drawn on Canvas
     */
    override fun draw(canvas: Canvas) {
        super.draw(canvas)

        val paint = Paint()
        paint.setColor(Color.WHITE)
        paint.setStyle(Paint.Style.FILL)
        canvas.drawPaint(paint)

        paint.setColor(Color.BLACK)
        paint.setTextSize(20.toFloat())
        canvas.drawText("Some Text", 10.toFloat(), 25.toFloat(), paint)

        skull!!.draw(canvas)
        ball!!.draw(canvas)
        ball_hl!!.draw(canvas)
        key!!.draw(canvas)
        //player!!.draw(canvas)
    }

    override fun onTouchEvent(event: MotionEvent): Boolean {
        // when ever there is a touch on the screen,
        // we can get the position of touch
        // which we may use it for tracking some of the game objects
        touched_x = event.x.toInt()
        touched_y = event.y.toInt()

        val action = event.action
        when (action) {
            MotionEvent.ACTION_DOWN -> touched = true
            MotionEvent.ACTION_MOVE -> touched = true
            MotionEvent.ACTION_UP -> touched = false
            MotionEvent.ACTION_CANCEL -> touched = false
            MotionEvent.ACTION_OUTSIDE -> touched = false
        }
        return true
    }

}
