import { useState, useEffect, useCallback, useRef } from 'react'
import { Connection, PublicKey, Transaction, SystemProgram, Keypair, sendAndConfirmTransaction } from '@solana/web3.js'
import bs58 from 'bs58'

interface IndexProps {}

const connection = new Connection('https://api.devnet.solana.com', 'confirmed')

export default function Home({}: IndexProps) {
  const [score, setScore] = useState(0)
  const [balance, setBalance] = useState(0.0001)
  const [transactionCount, setTransactionCount] = useState(0)
  const [walletAddress, setWalletAddress] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const lastTransactionRef = useRef<number>(0)

  const connectWallet = async () => {
    if (typeof window !== 'undefined' && (window as any).solana) {
      try {
        const accounts = await (window as any).solana.connect()
        setWalletAddress(accounts.publicKey.toBase58())
        setIsConnected(true)
        const bal = await connection.getBalance(accounts.publicKey)
        setBalance(bal / 1_000_000_000)
      } catch (error) {
        console.error('Wallet connection failed:', error)
      }
    } else {
      alert('Please install Phantom wallet!')
    }
  }

  const disconnectWallet = async () => {
    if (typeof window !== 'undefined' && (window as any).solana) {
      await (window as any).solana.disconnect()
      setIsConnected(false)
      setWalletAddress('')
    }
  }

  const handleHit = async (points: number) => {
    setScore(prev => {
      const newScore = prev + points
      const newBalance = balance + (points * 0.000001)
      setBalance(newBalance)
      setTransactionCount(prevCount => prevCount + 1)
      setShowConfetti(true)
      
      // Confetti reset
      setTimeout(() => setShowConfetti(false), 1000)
      
      // Flash animation for transaction
      lastTransactionRef.current = Date.now()
      
      return newScore
    })
  }

  const transactionFlash = Date.now() - lastTransactionRef.current < 1000

  return (
    <div className="min-h-screen bg-solana-dark relative overflow-hidden">
      {/* Aurora Background Animation */}
      <div className="aurora"></div>
      
      {/* Grid Overlay */}
      <div className="bg-grid absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none"></div>
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-solana-green mb-4 retro-font drop-shadow-[0_0_20px_rgba(36,195,134,0.7)]">
            ⚡ SOLANA TIME MACHINE ⚡
          </h1>
          <p className="text-xl text-gray-300 mb-2">
            Play-Pto-Earn Retro Arcade
          </p>
          <p className="text-sm text-solana-green/80">
            Every hit = 0.000001 SOL earned instantly
          </p>
        </div>

        {/* Wallet Section */}
        <div className="flex justify-center mb-8">
          {!isConnected ? (
            <button 
              onClick={connectWallet}
              className="glow-button retro-font text-xl px-8 py-4"
            >
              🔗 Connect Phantom Wallet
            </button>
          ) : (
            <div className="flex items-center gap-6 bg-black/30 rounded-full px-8 py-4 border border-solana-green/30 neon-border">
              <span className="solana-green text-lg">✓ Connected</span>
              <span className="font-mono text-solana-green">
                {walletAddress.slice(0, 4)}...{walletAddress.slice(-4)}
              </span>
              <button 
                onClick={disconnectWallet}
                className="px-4 py-2 bg-red-600/30 hover:bg-red-600/50 rounded-full text-sm transition-all"
              >
                Disconnect
              </button>
            </div>
          )}
        </div>

        {/* Scoreboard with Animations */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-black/30 rounded-xl p-6 text-center border border-solana-green/30 neon-border">
            <div className="text-sm text-gray-400 retro-font mb-2">SCORE</div>
            <div className="score-counter text-4xl font-bold text-solana-green">{score}</div>
          </div>
          
          <div className={`bg-black/30 rounded-xl p-6 text-center border border-solana-green/30 neon-border transition-all ${transactionFlash ? 'transaction-flash' : ''}`}>
            <div className="text-sm text-gray-400 retro-font mb-2">BALANCE</div>
            <div className="text-2xl font-bold text-solana-green">
              {balance.toFixed(6)} SOL
            </div>
            <div className="text-xs text-gray-500 mt-1">
              ${(balance * 1000).toFixed(2)} (est. USD)
            </div>
          </div>
          
          <div className="bg-black/30 rounded-xl p-6 text-center border border-solana-green/30 neon-border">
            <div className="text-sm text-gray-400 retro-font mb-2">TRANSACTIONS</div>
            <div className="score-counter text-3xl font-bold text-solana-green">{transactionCount}</div>
          </div>
          
          <div className="bg-black/30 rounded-xl p-6 text-center border border-solana-green/30 neon-border">
            <div className="text-sm text-gray-400 retro-font mb-2">SPEED</div>
            <div className="text-xl font-bold text-solana-green">400ms</div>
            <div className="text-xs text-gray-500 mt-1">(Solana)</div>
          </div>
        </div>

        {/* Game Container with Animation */}
        <div className="relative mb-8">
          <div className="absolute -top-4 -left-4 -right-4 -bottom-4 bg-gradient-to-r from-solana-green/20 via-transparent to-solana-green/20 rounded-3xl animate-pulse"></div>
          <div className="relative bg-black/50 rounded-2xl border-2 border-solana-green/50 overflow-hidden neon-border">
            <PongGame onHit={handleHit} isActive={true} />
          </div>
        </div>

        {/* Confetti Animation */}
        {showConfetti && (
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-50">
            {Array.from({ length: 50 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-solana-green rounded-full animate-bounce"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${1 + Math.random() * 2}s`
                }}
              />
            ))}
          </div>
        )}

        {/* Footer with Speed Comparison */}
        <div className="text-center mt-8">
          <div className="bg-black/30 rounded-xl p-6 border border-solana-green/30 neon-border max-w-2xl mx-auto">
            <h3 className="text-solana-green font-bold mb-3 retro-font text-xl">
              ⚡ Why Solana Wins ⚡
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="bg-solana-dark/30 rounded-lg p-4">
                <p className="text-solana-green font-bold">Transaction Time</p>
                <p className="text-gray-300">400ms Solana vs 60+ seconds Ethereum</p>
              </div>
              <div className="bg-solana-dark/30 rounded-lg p-4">
                <p className="text-solana-green font-bold">Transaction Cost</p>
                <p className="text-gray-300">$0.00025 vs $10+ on Ethereum</p>
              </div>
            </div>
          </div>
        </div>

        {/* Power Button */}
        <div className="text-center mt-6">
          <button 
            onClick={() => window.location.reload()}
            className="glow-button retro-font text-sm px-6 py-3"
          >
            🔄 Reset Game
          </button>
        </div>
      </div>
    </div>
  )
}

// Updated Pong Game with FULL animations
interface PongGameProps {
  onHit: (points: number) => void
  isActive: boolean
}

function PongGame({ onHit, isActive }: PongGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const scoreRef = useRef(0)
  const animationRef = useRef<number>()
  
  useEffect(() => {
    if (!canvasRef.current || !isActive) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const PADDLE_WIDTH = 12
    const PADDLE_HEIGHT = 100
    const BALL_SIZE = 12
    const SPEED = 6

    let paddleY = (canvas.height - PADDLE_HEIGHT) / 2
    let ballX = canvas.width / 2
    let ballY = canvas.height * 0.4
    let ballDX = -SPEED
    let ballDY = SPEED * (Math.random() > 0.5 ? 1 : -1)
    let rotation = 0

    const movePaddle = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const mouseY = e.clientY - rect.top
      paddleY = Math.max(0, Math.min(canvas.height - PADDLE_HEIGHT, mouseY))
    }

    const checkCollision = () => {
      if (ballX <= PADDLE_WIDTH && ballX + BALL_SIZE > paddleY && ballX + BALL_SIZE < paddleY + PADDLE_HEIGHT) {
        ballDX = SPEED
        scoreRef.current++
        onHit(1)
      }
      
      if (ballX + BALL_SIZE >= canvas.width) {
        ballX = canvas.width / 2
        ballY = canvas.height * 0.4
        ballDX = -SPEED
        rotation += 0.2
      }
    }

    const gameLoop = () => {
      if (!ctx) return

      // Gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      gradient.addColorStop(0, '#0A2242')
      gradient.addColorStop(1, '#1e3a8a')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Pulsating grid
      ctx.strokeStyle = 'rgba(36, 195, 134, 0.1)'
      ctx.lineWidth = 1
      for (let x = 0; x < canvas.width; x += 40) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvas.height)
        ctx.stroke()
      }

      ballX += ballDX
      ballY += ballDY

      if (ballY <= 0 || ballY >= canvas.height - BALL_SIZE) ballDY = -ballDY

      checkCollision()

      // Paddle with glow
      const paddleGradient = ctx.createLinearGradient(0, paddleY, PADDLE_WIDTH, paddleY + PADDLE_HEIGHT)
      paddleGradient.addColorStop(0, '#24C386')
      paddleGradient.addColorStop(1, '#16a34a')
      ctx.fillStyle = paddleGradient
      ctx.fillRect(0, paddleY, PADDLE_WIDTH, PADDLE_HEIGHT)

      // Ball with rotation
      ctx.save()
      ctx.translate(ballX + BALL_SIZE / 2, ballY + BALL_SIZE / 2)
      ctx.rotate(rotation)
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(-BALL_SIZE / 2, -BALL_SIZE / 2, BALL_SIZE, BALL_SIZE)
      ctx.restore()

      // Score display with glow
      ctx.fillStyle = '#24C386'
      ctx.shadowBlur = 20
      ctx.shadowColor = 'rgba(36, 195, 134, 0.5)'
      ctx.font = '20px "Press Start 2P", monospace'
      ctx.fillText(`Hits: ${scoreRef.current}`, canvas.width - 150, 35)
      ctx.shadowBlur = 0

      animationRef.current = requestAnimationFrame(gameLoop)
    }

    canvas.addEventListener('mousemove', movePaddle)
    gameLoop()

    return () => {
      canvas.removeEventListener('mousemove', movePaddle)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isActive, onHit])

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={500}
      className="w-full rounded-xl shadow-2xl shadow-solana-green/20"
    />
  )
}