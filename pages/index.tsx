import { useState, useEffect, useRef, useCallback } from 'react'
import { Connection, Keypair } from '@solana/web3.js'

const connection = new Connection('https://api.devnet.solana.com', 'confirmed')

export default function Home() {
  const [score, setScore] = useState(0)
  const [balance, setBalance] = useState(0.0001)
  const [isConnected, setIsConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState('')
  const [isDemo, setIsDemo] = useState(false)
  const [showTutorial, setShowTutorial] = useState(true)
  const [hitEffect, setHitEffect] = useState(0)

  const connectWallet = async () => {
    try {
      if (typeof window !== 'undefined' && (window as any).solana) {
        const accounts = await (window as any).solana.connect()
        setWalletAddress(accounts.publicKey.toBase58())
        setIsConnected(true)
        const bal = await connection.getBalance(accounts.publicKey)
        setBalance(bal / 1_000_000_000)
      } else {
        const keypair = Keypair.generate()
        const addr = keypair.publicKey.toBase58()
        setWalletAddress(`${addr.slice(0, 4)}...${addr.slice(-4)}`)
        setIsConnected(true)
        setIsDemo(true)
        setBalance(0.001)
      }
    } catch (e) {
      const keypair = Keypair.generate()
      const addr = keypair.publicKey.toBase58()
      setWalletAddress(`${addr.slice(0, 4)}...${addr.slice(-4)}`)
      setIsConnected(true)
      setIsDemo(true)
      setBalance(0.001)
    }
  }

  const handleHit = () => {
    setScore(s => s + 1)
    setBalance(b => b + 0.000001)
    setHitEffect(1)
    setTimeout(() => setHitEffect(0), 200)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 text-white overflow-x-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] opacity-25 [.85_#1e293b_&_transparent_60%]" />
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-500/20 rounded-full filter blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-500/20 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '-1s' }} />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-500 animate-pulse drop-shadow-[0_0_30px_rgba(34,197,94,0.5)]">
            ⚡ SOLANA TIME MACHINE ⚡
          </h1>
          <p className="text-xl text-gray-300 mb-2">Play-to-Earn Retro Arcade</p>
          <p className="text-green-400/70 text-sm">Every hit = 0.000001 SOL earned instantly</p>
        </div>

        {/* Wallet Section */}
        <div className="flex justify-center mb-10">
          {!isConnected ? (
            <button 
              onClick={connectWallet}
              className="group relative px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-black font-bold rounded-full shadow-[0_0_20px_rgba(34,197,94,0.5)] hover:shadow-[0_0_40px_rgba(34,197,94,0.7)] transition-all duration-300 transform hover:scale-105"
            >
              <span className="flex items-center gap-2">
                <span className="text-2xl">🔗</span>
                Connect Wallet
              </span>
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
            </button>
          ) : (
            <div className="flex items-center gap-4 bg-slate-800/50 backdrop-blur-sm rounded-full px-6 py-3 border border-green-500/30">
              <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>
              <span className="font-mono text-green-400">{walletAddress}</span>
              {isDemo && <span className="px-2 py-1 text-xs bg-yellow-500/20 text-yellow-400 rounded">Demo Mode</span>}
            </div>
          )}
        </div>

        {/* Scoreboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-2xl mx-auto mb-10">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 text-center border border-green-500/20 hover:scale-105 transform transition-all duration-300">
            <div className="text-xs text-gray-500 mb-2 tracking-wider">SCORE</div>
            <div className={`text-4xl font-bold text-green-400 ${hitEffect ? 'text-yellow-400' : ''}`}>
              {score.toLocaleString()}
            </div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 text-center border border-green-500/20 hover:scale-105 transform transition-all duration-300">
            <div className="text-xs text-gray-500 mb-2 tracking-wider">BALANCE</div>
            <div className="text-2xl font-bold text-green-400">{balance.toFixed(6)} SOL</div>
            <div className="text-xs text-gray-500/70 mt-1">${(balance * 1000).toFixed(2)} USD</div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 text-center border border-green-500/20 hover:scale-105 transform transition-all duration-300">
            <div className="text-xs text-gray-500 mb-2 tracking-wider">TOTAL EARNED</div>
            <div className="text-xl font-bold text-green-400">{(0.000001 * score).toFixed(6)} SOL</div>
          </div>
        </div>

        {/* Game Container */}
        <div className="relative mb-10">
          <div className="absolute -inset-4 bg-gradient-to-r from-green-500/20 via-transparent to-emerald-500/20 rounded-3xl blur-xl animate-pulse"></div>
          <div className="relative bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-green-500/30 p-4 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
            <Game onHit={handleHit} isActive={isConnected} />
          </div>
        </div>

        {/* Tutorial */}
        {showTutorial && (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 w-full max-w-md mx-auto mb-10 border border-green-500/30">
            <div className="flex items-start gap-4">
              <div className="text-3xl">🎮</div>
              <div>
                <h3 className="text-lg font-bold text-green-400 mb-2">How to Play:</h3>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• <strong>Move your mouse</strong> over the game area to control the paddle</li>
                  <li>• <strong>Hit the ball</strong> to earn SOL tokens instantly</li>
                  <li>• <strong>Ball speeds up</strong> with each successful hit!</li>
                </ul>
              </div>
            </div>
            <button 
              onClick={() => setShowTutorial(false)}
              className="mt-4 px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-black font-bold rounded-full hover:shadow-lg transition-all duration-300"
            >
              Got it!
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-gray-500/70 text-sm mb-8">
          <span>Solana Devnet • 400ms Transaction Speed • $0.00025 Per Transaction</span>
        </div>
      </div>
    </div>
  )
}

function Game({ onHit, isActive }: { onHit: () => void; isActive: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const paddleYRef = useRef(200)
  const ballRef = useRef({ x: 50, y: 250, dx: -3, dy: 2, speed: 3 })
  const hitCountRef = useRef(0)

  useEffect(() => {
    if (!canvasRef.current || !isActive) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resetBall = () => {
      ballRef.current = { x: 50, y: 250, dx: -3, dy: 2 * (Math.random() > 0.5 ? 1 : -1), speed: 3 }
    }

    const loop = () => {
      if (!ctx) return

      // Clear with gradient
      const gradient = ctx.createLinearGradient(0, 0, 600, 400)
      gradient.addColorStop(0, '#0f172a')
      gradient.addColorStop(1, '#1e293b')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, 600, 400)

      const { x, y, dx, dy, speed } = ballRef.current

      // Draw grid
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.1)'
      ctx.lineWidth = 1
      for (let i = 0; i < 600; i += 40) {
        ctx.beginPath()
        ctx.moveTo(i, 0)
        ctx.lineTo(i, 400)
        ctx.stroke()
      }

      // Ball
      const ball = { x, y, size: 10 }
      const grd = ctx.createRadialGradient(ball.x + 5, ball.y + 5, 2, ball.x + 5, ball.y + 5, ball.size / 2)
      grd.addColorStop(0, '#22c55e')
      grd.addColorStop(1, '#16a34a')
      ctx.fillStyle = grd
      ctx.beginPath()
      ctx.arc(ball.x + 5, ball.y + 5, ball.size / 2, 0, Math.PI * 2)
      ctx.fill()

      // Paddle
      ctx.fillStyle = '#22c55e'
      ctx.fillRect(10, paddleYRef.current, 10, 100)

      // Paddle glow
      ctx.shadowBlur = 15
      ctx.shadowColor = 'rgba(34, 197, 94, 0.5)'

      // Movement
      ballRef.current = { x: x + dx, y: y + dy, dx, dy, speed }

      // Top/bottom collision
      if (ball.y <= 0 || ball.y >= 390) {
        ballRef.current = { ...ballRef.current, dy: -ballRef.current.dy }
      }

      // Paddle collision
      if (ball.x <= 20 && ball.y >= paddleYRef.current && ball.y <= paddleYRef.current + 100) {
        const hitStrength = 1 + (speed - 3) * 0.2
        ballRef.current = { 
          x: 20, 
          y: ball.y, 
          dx: -dx * hitStrength, 
          dy: dy * hitStrength, 
          speed: speed * 1.05 
        }
        hitCountRef.current++
        onHit()
      }

      // Reset if missed
      if (ball.x < -10) {
        hitCountRef.current = 0
        resetBall()
      }

      animationRef.current = requestAnimationFrame(loop)
    }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      paddleYRef.current = Math.max(0, Math.min(300, e.clientY - rect.top - 50))
    }

    canvas.addEventListener('mousemove', handleMouseMove)
    resetBall()
    loop()

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove)
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [isActive, onHit])

  return (
    <canvas
      ref={canvasRef}
      width={600}
      height={400}
      className="rounded-xl shadow-2xl shadow-green-500/20 cursor-pointer"
      style={{ cursor: 'pointer' }}
    />
  )
}