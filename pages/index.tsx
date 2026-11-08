import { useState, useEffect, useRef } from 'react'
import { Connection, Keypair } from '@solana/web3.js'

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
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center p-4">
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-slate-900 to-slate-800"></div>
      
      <h1 className="text-4xl font-bold mb-6 text-green-400">⚡ Solana Time Machine</h1>
      <p className="text-gray-400 mb-8">Play-to-Earn Pong Arcade</p>
      
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
          <div className="text-lg font-bold text-green-400">{(0.000001 * score).toFixed(6)} SOL</div>
        </div>
      </div>
      
      <div className="bg-slate-800 rounded-xl p-4 mb-8">
        <Game onHit={handleHit} isActive={isConnected} />
      </div>
      
      {showTutorial && (
        <div className="bg-slate-800 p-4 rounded-lg w-full max-w-md mb-8">
          <h3 className="font-bold mb-2">How to Play:</h3>
          <ul className="text-sm space-y-1">
            <li>• Move mouse to control paddle</li>
            <li>• Hit ball to earn SOL</li>
          </ul>
          <button onClick={() => setShowTutorial(false)} className="mt-2 px-4 py-2 bg-green-500 rounded">Got it!</button>
        </div>
      )}
      
      <div className="text-center text-gray-500 text-sm">Built with Next.js + Solana</div>
    </div>
  )
}

function Game({ onHit, isActive }: { onHit: () => void; isActive: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const paddleYRef = useRef(200)
  const ballXRef = useRef(50)
  const ballYRef = useRef(250)

  useEffect(() => {
    if (!canvasRef.current || !isActive) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let dx = -3
    let dy = 2

    const loop = () => {
      if (!ctx) return
      
      ctx.fillStyle = '#1e293b'
      ctx.fillRect(0, 0, 600, 400)

      ctx.strokeStyle = 'rgba(34, 197, 94, 0.1)'
      ctx.lineWidth = 1
      for (let i = 0; i < 600; i += 40) {
        ctx.beginPath()
        ctx.moveTo(i, 0)
        ctx.lineTo(i, 400)
        ctx.stroke()
      }

      ctx.fillStyle = '#22c55e'
      ctx.fillRect(ballXRef.current, ballYRef.current, 10, 10)
      ctx.fillRect(10, paddleYRef.current, 10, 100)

      ballXRef.current += dx
      ballYRef.current += dy

      if (ballYRef.current <= 0 || ballYRef.current >= 390) dy = -dy

      if (ballXRef.current <= 20 && ballYRef.current >= paddleYRef.current && ballYRef.current <= paddleYRef.current + 100) {
        dx = -dx
        onHit()
      }
      
      if (ballXRef.current < -10) {
        ballXRef.current = 50
        ballYRef.current = 250
        dx = -3
      }

      animationRef.current = requestAnimationFrame(loop)
    }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      paddleYRef.current = Math.max(0, Math.min(300, e.clientY - rect.top - 50))
    }

    canvas.addEventListener('mousemove', handleMouseMove)
    loop()

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove)
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [isActive, onHit])

  return (
    <canvas ref={canvasRef} width={600} height={400} className="rounded-lg" />
  )
}