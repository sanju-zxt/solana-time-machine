import { NextApiRequest, NextApiResponse } from 'next'
import { Connection, PublicKey, Keypair, Transaction } from '@solana/web3.js'

const connection = new Connection('https://api.devnet.solana.com')

interface MintRequest {
  score: number
  wallet: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  
  const { score, wallet }: MintRequest = req.body

  // FALLBACK: Return mock NFT data
  // In production, this would connect to Metaplex to mint on-chain
  res.status(200).json({
    success: true,
    name: `Arcade Champion #${Date.now()}`,
    description: `Score: ${score} points in Solana Time Machine`,
    image: `data:image/svg+xml;base64,${Buffer.from(`
      <svg width="500" height="500" xmlns="http://www.w3.org/2000/svg">
        <rect width="500" height="500" fill="#0A2242"/>
        <circle cx="250" cy="250" r="150" fill="#24C386"/>
        <path d="M250 100 L350 400 L150 400 Z" fill="#FFFFFF"/>
        <text x="250" y="280" font-size="40" font-family="Arial" fill="#0A2242" text-anchor="middle" font-weight="bold">${score}</text>
      </svg>
    `).toString('base64')}`,
    uri: `https://solana-time-machine.vercel.app/api/nft/data/${Date.now()}`,
    properties: {
      attributes: [
        { trait_type: 'Game', value: 'Pong' },
        { trait_type: 'Score', value: score.toString() },
        { trait_type: 'Platform', value: 'Solana Time Machine' }
      ]
    },
    signature: `demo_${Date.now()}`
  })
}