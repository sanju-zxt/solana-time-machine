import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { Connection, PublicKey, Transaction, SystemProgram, Keypair, sendAndConfirmTransaction } from '@solana/web3.js'
import bs58 from 'bs58'
import Link from 'next/link'

interface IndexProps {}

const connection = new Connection('https://api.devnet.solana.com', 'confirmed')

export default function Home({}: IndexProps) {
  const [score, setScore] = useState(0)
  const [balance, setBalance] = useState(0.0001)
  const [transactionCount, setTransactionCount] = useState(0)
  const [walletAddress, setWalletAddress] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [showTutorial, setShowTutorial] = useState(true)
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [transactions, setTransactions] = useState<Array<{id: number, amount: number, timestamp: number}>>([])
  const lastTransactionRef = useRef<number>(0)

  // Demo mode - simulates wallet connection for demo purposes
  const connectWallet = async () => {
    try {
      // Try real Phantom wallet first
      if (typeof window !== 'undefined' && (window as any).solana) {
        const accounts = await (window as any).solana.connect()
        setWalletAddress(accounts.publicKey.toBase58())
        setIsConnected(true)
        setIsDemoMode(false)
        const bal = await connection.getBalance(accounts.publicKey)
        setBalance(bal / 1_000_000_000)
      } else {
        // Demo mode fallback - generate simulated wallet
        const simulatedKeypair = Keypair.generate()
        const simulatedAddress = simulatedKeypair.publicKey.toBase58()
        setWalletAddress(simulatedAddress)
        setIsConnected(true)
        setIsDemoMode(true)
        setBalance(0.001) // Start with simulated balance
        console.log('🔍 Demo Mode: Simulated wallet', simulatedAddress)
      }
    } catch (error) {
      console.error('Wallet connection failed:', error)
      // Fallback to demo mode
      const simulatedKeypair = Keypair.generate()
      const simulatedAddress = simulatedKeypair.publicKey.toBase58()
      setWalletAddress(simulatedAddress)
      setIsConnected(true)
      setIsDemoMode(true)
      setBalance(0.001)
    }
  }

  const disconnectWallet = async () => {
    if (typeof window !== 'undefined' && (window as any).solana && !isDemoMode) {
      await (window as any).solana.disconnect()
    }
    setIsConnected(false)
    setWalletAddress('')
    setIsDemoMode(false)
  }

  const handleHit = async (points: number) => {
    const hitAmount = points * 0.000001
    const newBalance = balance + hitAmount
    
    setScore(prev => prev + points)
    setBalance(newBalance)
    setTransactionCount(prevCount => prevCount + 1)
    setShowConfetti(true)
    
    // Track transaction for history
    const newTx = {
      id: Date.now(),
      amount: hitAmount,
      timestamp: Date.now()
    }
    setTransactions(prev => [newTx, ...prev.slice(0, 9)])
    
    // Confetti reset
    setTimeout(() => setShowConfetti(false), 2000)
    
    // Flash animation for transaction
    lastTransactionRef.current = Date.now()
    
    return newBalance
  }

  const transactionFlash = Date.now() - lastTransactionRef.current < 1000

  // Formatted wallet address
  const displayAddress = walletAddress 
    ? `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`
    : ''

  // Total earned
  const totalEarned = useMemo(() => {
    return transactions.reduce((sum, tx) => sum + tx.amount, 0) + (balance - 0.0001)
  }, [transactions, balance])

  return (
    <div className="min-h-screen bg-solana-dark relative overflow-hidden">
      {/* Aurora Background Animation */}
      <div className="aurora fixed top-0 left-0 w-full h-full z-0"></div>
      
      {/* Grid Overlay */}
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none z-10 bg-grid"></div>
      
      <div className="container mx-auto px-4 py-8 relative z-20">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-solana-green mb-4 retro-font drop-shadow-[0_0_20px_rgba(36,195,134,0.7)] animate-pulse">
            ⚡ SOLANA TIME MACHINE ⚡
          </h1>
          <p className="text-xl text-gray-300 mb-2">
            Play-to-Earn Retro Arcade
          </p>
          <p className="text-sm text-solana-green/80">
            Every hit = 0.000001 SOL earned instantly
            {isDemoMode && <span className="block text-yellow-400 mt-1">(Demo Mode)</span>}
          </p>
        </div>

        {/* Tutorial Overlay - Show once */}
        {showTutorial && (
          <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-30 w-full max-w-2xl mx-auto px-4">
            <div className="bg-gradient-to-r from-solana-green/30 to-solana-dark/50 rounded-2xl p-6 border border-solana-green/50 neon-border backdrop-blur-sm">
              <div className="flex items-start gap-4">
                <div className="text-solana-green text-3xl">🎮</div>
                <div>
                  <h3 className="text-solana-green font-bold text-xl mb-2 retro-font">Game Tutorial</h3>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• <strong>Move your mouse</strong> over the game area to control the paddle</li>
                    <li>• <strong>Hit the ball</strong> to earn SOL tokens</li>
                    <li>• <strong>Ball speeds up</strong> with each hit!</li>
                    <li>• <strong>Click "Got it!"</strong> to close, or press ESC</li>
                  </ul>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button 
                  onClick={() => setShowTutorial(false)}
                  className="glow-button retro-font text-sm px-4 py-2"
                >
                  Got it!
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Wallet Section */}
        <div className="flex justify-center mb-8">
          {!isConnected ? (
            <button 
              onClick={connectWallet}
              className="glow-button retro-font text-xl px-8 py-4 flex items-center gap-2"
            >
              <span className="text-2xl">🔗</span>
              <span>Connect Phantom Wallet</span>
            </button>
          ) : (
            <div className="flex items-center gap-4 bg-black/30 rounded-full px-8 py-4 border border-solana-green/30 neon-border">
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${isDemoMode ? 'bg-yellow-400 animate-pulse' : 'bg-solana-green'}`}></span>
                <span className="solana-green text-lg">
                  {isDemoMode ? 'Demo Mode' : 'Connected'}
                </span>
              </div>
              <span className="font-mono text-solana-green text-lg">
                {displayAddress}
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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-black/30 rounded-xl p-6 text-center border border-solana-green/30 neon-border">
            <div className="text-sm text-gray-400 retro-font mb-2">SCORE</div>
            <div className="score-counter text-4xl font-bold text-solana-green animate-countUp">
              {score.toLocaleString()}
            </div>
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
            <div className="score-counter text-3xl font-bold text-solana-green">
              {transactionCount}
            </div>
          </div>
          
          <div className="bg-black/30 rounded-xl p-6 text-center border border-solana-green/30 neon-border">
            <div className="text-sm text-gray-400 retro-font mb-2">SPEED</div>
            <div className="text-xl font-bold text-solana-green">400ms</div>
            <div className="text-xs text-gray-500 mt-1">(Solana)</div>
          </div>
          
          <div className="bg-black/30 rounded-xl p-6 text-center border border-solana-green/30 neon-border">
            <div className="text-sm text-gray-400 retro-font mb-2">TOTAL EARNED</div>
            <div className="text-lg font-bold text-solana-green">
              {totalEarned.toFixed(6)} SOL
            </div>
          </div>
        </div>

        {/* Game Container with Animation */}
        <div className="relative mb-8">
          <div className="absolute -top-4 -left-4 -right-4 -bottom-4 bg-gradient-to-r from-solana-green/20 via-transparent to-solana-green/20 rounded-3xl animate-pulse"></div>
          <div className="relative bg-black/50 rounded-2xl border-2 border-solana-green/50 overflow-hidden neon-border">
            <PongGame onHit={handleHit} isActive={isConnected} />
          </div>
        </div>

        {/* Confetti Animation */}
        {showConfetti && (
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-50 overflow-hidden">
            {Array.from({ length: 80 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-3 h-3 bg-solana-green rounded-full animate-bounce"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${1.5 + Math.random() * 1.5}s`,
                  boxShadow: `0 0 10px rgba(36, 195, 134, 0.8)`
                }}
              />
            ))}
          </div>
        )}

        {/* Transaction History */}
        {transactions.length > 0 && (
          <div className="mb-8">
            <h3 className="text-solana-green font-bold mb-3 retro-font text-lg">
              Recent Transactions ⚡
            </h3>
            <div className="bg-black/30 rounded-xl border border-solana-green/30 neon-border p-4 max-w-md">
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {transactions.slice(0, 5).map((tx) => (
                  <div key={tx.id} className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">Hit #{tx.id - transactions[0].id}</span>
                    <span className="solana-green font-bold">+{tx.amount.toFixed(6)} SOL</span>
                  </div>
                ))}
              </div>
            </div>
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
              <div className="bg-solana-dark/30 rounded-lg p-4">
                <p className="text-solana-green font-bold">Throughput</p>
                <p className="text-gray-300">65,000 TPS vs 15 TPS</p>
              </div>
              <div className="bg-solana-dark/30 rounded-lg p-4">
                <p className="text-solana-green font-bold">Finality</p>
                <p className="text-gray-300">~400ms vs ~6 minutes</p>
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
        
        {/* Source Code Link */}
        <div className="text-center mt-4">
          <a 
            href="https://github.com/sanju-zxt/solana-time-machine"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-solana-green transition-colors text-sm"
          >
            📁 View Source Code on GitHub
          </a>
        </div>
      </div>
    </div>
  )
}

// Pong Game with Enhanced Features
interface PongGameProps {
  onHit: (points: number) => void
  isActive: boolean
}

function PongGame({ onHit, isActive }: PongGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const scoreRef = useRef(0)
  const animationRef = useRef<number>()
  const lastHitTimeRef = useRef<number>(Date.now())
  const [speedMultiplier, setSpeedMultiplier] = useState(1)
  
  // Handle game reset when inactive
  useEffect(() => {
    if (!isActive) {
      // Reset game state when wallet disconnected
      scoreRef.current = 0
    }
  }, [isActive])

  useEffect(() => {
    if (!canvasRef.current || !isActive) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const PADDLE_WIDTH = 12
    const PADDLE_HEIGHT = 100
    const BALL_SIZE = 12
    const BASE_SPEED = 6
    const MAX_SPEED = 20
    
    let paddleY = (canvas.height - PADDLE_HEIGHT) / 2
    let ballX = canvas.width / 2
    let ballY = canvas.height * 0.4
    let ballDY = BASE_SPEED * (Math.random() > 0.5 ? 1 : -1)
    let rotation = 0
    let paddleX = 0

    const movePaddle = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const mouseY = e.clientY - rect.top
      paddleY = Math.max(0, Math.min(canvas.height - PADDLE_HEIGHT, mouseY))
    }

    const checkCollision = () => {
      const currentSpeed = Math.min(BASE_SPEED * speedMultiplier, MAX_SPEED)
      
      if (ballX <= PADDLE_WIDTH && ballX + BALL_SIZE > paddleY && ballX + BALL_SIZE < paddleY + PADDLE_HEIGHT) {
        const hitX = ballX + BALL_SIZE
        const relativeHitY = (hitX - paddleY) / PADDLE_HEIGHT
        ballDY = currentSpeed * (relativeHitY * 2 - 1)
        scoreRef.current++
        onHit(1)
        
        // Increase speed with each hit
        setSpeedMultiplier(prev => Math.min(prev + 0.1, 3))
        
        // Show hit effect
        ballX -= 5
      }
      
      if (ballX + BALL_SIZE >= canvas.width - BALL_SIZE) {
        ballX = canvas.width / 2
        ballY = canvas.height * 0.4
        ballDY = BASE_SPEED * (Math.random() > 0.5 ? 1 : -1) * speedMultiplier
        rotation += 0.2
      }
    }

    const gameLoop = () => {
      if (!ctx) return

      const currentSpeed = Math.min(BASE_SPEED * speedMultiplier, MAX_SPEED)
      const ballDX = -currentSpeed
      
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

      if (ballY <= 0 || ballY >= canvas.height - BALL_SIZE) {
        ballDY = -ballDY
      }

      checkCollision()

      // Paddle with glow
      const paddleGradient = ctx.createLinearGradient(paddleX, paddleY, paddleX + PADDLE_WIDTH, paddleY + PADDLE_HEIGHT)
      paddleGradient.addColorStop(0, '#24C386')
      paddleGradient.addColorStop(1, '#16a34a')
      ctx.fillStyle = paddleGradient
      ctx.fillRect(paddleX, paddleY, PADDLE_WIDTH, PADDLE_HEIGHT)

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
    canvas.addEventListener('mouseenter', () => {
      // On hover, auto-start the ball
    })
    gameLoop()

    return () => {
      canvas.removeEventListener('mousemove', movePaddle)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isActive, onHit, speedMultiplier])

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={500}
      className="w-full rounded-xl shadow-2xl shadow-solana-green/20 cursor-pointer"
      style={{ cursor: 'pointer' }}
    />
  )
}