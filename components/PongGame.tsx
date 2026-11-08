import { useState, useRef, useEffect, useCallback } from 'react'
import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js'

interface PongGameProps {
  onHit: (points: number) => void
  isActive: boolean
}

export default function PongGame({ onHit, isActive }: PongGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const scoreRef = useRef(0)
  const [gameScore, setGameScore] = useState(0)
  const [connection, setConnection] = useState(new Connection('https://api.devnet.solana.com', 'confirmed'))

  useEffect(() => {
    if (!canvasRef.current || !isActive) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const PADDLE_WIDTH = 10
    const PADDLE_HEIGHT = 100
    const BALL_SIZE = 10
    const SPEED = 5

    let paddleY = (canvas.height - PADDLE_HEIGHT) / 2
    let ballX = canvas.width / 2
    let ballY = canvas.height * 0.4
    let ballDX = -SPEED
    let ballDY = SPEED * (Math.random() > 0.5 ? 1 : -1)

    let hitCount = 0
    const HIT_INTERVAL = 10

    const movePaddle = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const mouseY = e.clientY - rect.top
      paddleY = Math.max(0, Math.min(canvas.height - PADDLE_HEIGHT, mouseY))
    }

    const checkCollision = () => {
      if (ballX <= PADDLE_WIDTH && ballX + BALL_SIZE > paddleY && ballX + BALL_SIZE < paddleY + PADDLE_HEIGHT) {
        ballDX = SPEED
        hitCount++
        
        if (hitCount % HIT_INTERVAL === 0) {
          onHit(1)
          hitCount = 0
        }
      }
      
      if (ballX + BALL_SIZE >= canvas.width) {
        ballDX = -SPEED
        ballX = canvas.width - BALL_SIZE
        hitCount++
        
        if (hitCount % HIT_INTERVAL === 0) {
          onHit(1)
          hitCount = 0
        }
      }
    }

    const gameLoop = () => {
      if (!ctx) return

      ctx.fillStyle = '#0A2242'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.strokeStyle = 'rgba(36, 195, 134, 0.1)'
      ctx.lineWidth = 1
      for (let x = 0; x < canvas.width; x += 50) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvas.height)
        ctx.stroke()
      }

      ballX += ballDX
      ballY += ballDY

      if (ballY <= 0 || ballY >= canvas.height - BALL_SIZE) ballDY = -ballDY

      checkCollision()

      ctx.fillStyle = '#24C386'
      ctx.fillRect(0, paddleY, PADDLE_WIDTH, PADDLE_HEIGHT)

      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(ballX, ballY, BALL_SIZE, BALL_SIZE)

      ctx.fillStyle = '#24C386'
      ctx.font = '16px "Press Start 2P", monospace'
      ctx.fillText(`Hits: ${scoreRef.current}`, canvas.width - 120, 30)
    }

    canvas.addEventListener('mousemove', movePaddle)
    const interval = setInterval(gameLoop, 16)

    return () => {
      canvas.removeEventListener('mousemove', movePaddle)
      clearInterval(interval)
    }
  }, [isActive, onHit])

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={500}
      className="w-full rounded-lg shadow-2xl shadow-solana-green/20 bg-black"
      style={{ display: isActive ? 'block' : 'none' }}
    />
  )
}