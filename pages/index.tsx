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
    <div className="min-h-screen bg-gray-50 flex flex-col items-center">
      {/* Header - Payment Style */}
      <div className="w-full max-w-4xl mt-12 px-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                ⚡ Solana Time Machine
              </h1>
              <p className="text-gray-600">Play-to-Earn Pong Arcade</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">🎮</span>
            </div>
          </div>

          {/* Wallet Section - Payment Button Style */}
          {!isConnected ? (
            <div className="text-center mb-8">
              <button 
                onClick={connectWallet}
                className="inline-flex items-center justify-center px-8 py-4 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors shadow-md"
              >
                <span className="mr-2">🔗</span>
                Connect Wallet
              </button>
              <p className="text-sm text-gray-500 mt-3">Connect your Solana wallet to start playing</p>
            </div>
          ) : (
            <div className="flex items-center justify-center mb-8">
              <div className="bg-gray-50 px-4 py-2 rounded-full border border-gray-200">
                <span className="text-sm text-gray-600 mr-2">Connected:</span>
                <span className="font-mono text-gray-800 text-sm">
                  {walletAddress}
                </span>
                {isDemo && (
                  <span className="ml-2 px-2 py-0.5 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded">
                    Demo Mode
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Stats - Payment Style Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
              <div className="text-xs font-medium text-gray-500 mb-2">SCORE</div>
              <div className="text-3xl font-bold text-gray-900">{score}</div>
            </div>
            <div className="border-2 border-green-200 bg-white rounded-xl p-6 text-center">
              <div className="text-xs font-medium text-gray-500 mb-2">BALANCE</div>
              <div className="text-2xl font-bold text-green-600">{balance.toFixed(6)} SOL</div>
              <div className="text-xs text-gray-500 mt-1">${(balance * 1000).toFixed(2)} USD</div>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
              <div className="text-xs font-medium text-gray-500 mb-2">EARNED</div>
              <div className="text-xl font-bold text-gray-900">{(0.000001 * score).toFixed(6)} SOL</div>
            </div>
          </div>

          {/* Game Container */}
          <div className="text-center mb-8">
            <div className="inline-block bg-gray-100 rounded-2xl p-4">
              <Game onHit={handleHit} isActive={isConnected} />
            </div>
          </div>

          {/* Tutorial Modal - Payment Style */}
          {showTutorial && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
                <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
                  How to Play
                </h3>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start">
                    <span className="mr-3 text-green-600">✓</span>
                    <span className="text-gray-600">Move mouse over the game to control your paddle</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-3 text-green-600">✓</span>
                    <span className="text-gray-600">Hit the ball to earn 0.000001 SOL per hit</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-3 text-green-600">✓</span>
                    <span className="text-gray-600">Ball speeds up with each successful hit</span>
                  </li>
                </ul>
                <button 
                  onClick={() => setShowTutorial(false)}
                  className="w-full py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors"
                >
                  Start Playing
                </button>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="text-center py-6 border-t border-gray-100 mt-8">
            <p className="text-sm text-gray-500">
              Built with Next.js + Solana | 400ms Solana Transactions
            </p>
          </div>
        </div>
      </div>
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
      
      // Clear background
      ctx.fillStyle = '#f8fafc'
      ctx.fillRect(0, 0, 600, 400)

      // Draw grid
      ctx.strokeStyle = '#e2e8f0'
      ctx.lineWidth = 1
      for (let i = 0; i < 600; i += 40) {
        ctx.beginPath()
        ctx.moveTo(i, 0)
        ctx.lineTo(i, 400)
        ctx.stroke()
      }

      // Ball
      ctx.fillStyle = '#22c55e'
      ctx.fillRect(ballXRef.current, ballYRef.current, 10, 10)
      
      // Paddle
      ctx.fillStyle = '#64748b'
      ctx.fillRect(10, paddleYRef.current, 10, 100)

      // Ball movement
      ballXRef.current += dx
      ballYRef.current += dy

      // Top/bottom collision
      if (ballYRef.current <= 0 || ballYRef.current >= 390) dy = -dy

      // Paddle collision
      if (ballXRef.current <= 20 && ballYRef.current >= paddleYRef.current && ballYRef.current <= paddleYRef.current + 100) {
        dx = -dx
        onHit()
      }
      
      // Reset if missed
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
    <canvas 
      ref={canvasRef} 
      width={600} 
      height={400} 
      className="rounded-lg shadow-md cursor-pointer"
    />
  )
}