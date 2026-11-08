import { useState, useEffect, useRef } from 'react'
import { Connection, PublicKey, Keypair } from '@solana/web3.js'

const connection = new Connection('https://api.devnet.solana.com', 'confirmed')

export default function Home() {
  const [score, setScore] = useState(0)
  const [balance, setBalance] = useState(0.0001)
  const [isConnected, setIsConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState('')
  const [isDemo, setIsDemo] = useState(false)
  const [showTutorial, setShowTutorial] = useState(true)

  const connectWallet = async () => {
    try {
      if (typeof window !== 'undefined' && (window as any).solana) {
        const accounts = await (window as any).solana.connect()
        setWalletAddress(accounts.publicKey.toBase58())
        setIsConnected(true)
        const bal = await connection.getBalance(accounts.publicKey)
        setBalance(bal / 1_000_000_000)
      } else {
        // Demo mode
        const keypair = Keypair.generate()
        setWalletAddress(keypair.publicKey.toBase58().slice(0, 4) + '...' + keypair.publicKey.toBase58().slice(-4))
        setIsConnected(true)
        setIsDemo(true)
        setBalance(0.001)
      }
    } catch (e) {
      const keypair = Keypair.generate()
      setWalletAddress(keypair.publicKey.toBase58().slice(0, 4) + '...' + keypair.publicKey.toBase58().slice(-4))
      setIsConnected(true)
      setIsDemo(true)
      setBalance(0.001)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center p-4">
      {/* Aurora background - simple CSS */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-slate-900 to-slate-800"></div>
      
      {/* Header */}
      <h1 className="text-3xl font-bold mb-6 text-green-400">
        ⚡ Solana Time Machine
      </h1>
      <p className="text-gray-400 mb-8">Play-to-Earn Pong Arcade</p>

      {/* Wallet Section */}
      {!isConnected ? (
        <button onClick={connectWallet} className="px-6 py-3 bg-green-500 text-black font-bold rounded-lg mb-8">
          🔗 Connect Wallet
        </button>
      ) : (
        <div className="flex items-center gap-4 mb-8">
          <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>
          <span className="font-mono">{walletAddress}</span>
          {isDemo && <span className="text-yellow-400 text-xs">Demo</span>}
        </div>
      )}

      {/* Scoreboard */}
      <div className="grid grid-cols-3 gap-4 w-full max-w-md mb-8">
        <div className="bg-slate-800 p-4 rounded-lg text-center">
          <div className="text-xs text-gray-500">SCORE</div>
          <div className="text-2xl font-bold text-green-400">{score}</div>
        </div>
        <div className="bg-slate-800 p-4 rounded-lg text-center">
          <div className="text-xs text-gray-500">BALANCE</div>
          <div className="text-lg font-bold text-green-400">{balance.toFixed(6)} SOL</div>
        </div>
        <div className="bg-slate-800 p-4 rounded-lg text-center">
          <div className="text-xs text-gray-500">EARNED</div>
          <div className="text-lg font-bold text-green-400">{0.000001 * score}</div>
        </div>
      </div>

      {/* Simple Pong Game */}
      <div className="bg-slate-800 rounded-xl p-4 mb-8">
        <Game onHit={() => setScore(s => s + 1)} isActive={isConnected} />
      </div>

      {/* Tutorial */}
      {showTutorial && (
        <div className="bg-slate-800 p-4 rounded-lg w-full max-w-md mb-8">
          <h3 className="font-bold mb-2">How to Play:</h3>
          <ul className="text-sm space-y-1">
            <li>• Move mouse to control paddle</li>
            <li>• Hit the ball to earn 0.000001 SOL</li>
            <li>• Close this to start playing</li>
          </ul>
          <button onClick={() => setShowTutorial(false)} className="mt-2 px-4 py-2 bg-green-500 rounded">
            Got it!
          </button>
        </div>
      )}

      {/* Footer */}
      <div className="text-center text-gray-500 text-sm">
        Built with Next.js + Solana
      </div>
    </div>
  )
}

function Game({ onHit, isActive }: { onHit: () => void; isActive: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()

  useEffect(() => {
    if (!canvasRef.current || !isActive) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let x = 50, y = 250, dx = 3, dy = 2
    let paddleY = 200
    const height = 100

    const loop = () => {
      if (!ctx) return
      
      ctx.fillStyle = '#1e293b'
      ctx.fillRect(0, 0, 600, 400)

      // Ball
      ctx.fillStyle = '#22c55e'
      ctx.fillRect(x, y, 10, 10)
      
      // Paddle
      ctx.fillStyle = '#22c55e'
      ctx.fillRect(10, paddleY, 10, height)

      // Movement
      x += dx
      y += dy

      // Collision
      if (y <= 0 || y >= 390) dy = -dy
      if (x <= 20 && y >= paddleY && y <= paddleY + height) {
        dx = -dx
        onHit()
      }

      animationRef.current = requestAnimationFrame(loop)
    }

    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect()
      paddleY = e.clientY - rect.top - 50
      paddleY = Math.max(0, Math.min(300, paddleY))
    })

    loop()

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [isActive, onHit])

  return (
    <canvas ref={canvasRef} width={600} height={400} className="rounded-lg" />
  )
}