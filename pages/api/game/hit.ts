import { NextApiRequest, NextApiResponse } from 'next'
import { Connection, PublicKey, SystemProgram, Transaction, sendAndConfirmTransaction, Keypair } from '@solana/web3.js'
import bs58 from 'bs58'

const connection = new Connection('https://api.devnet.solana.com', 'confirmed')

const PAYER_PRIVATE_KEY = process.env.NEXT_PUBLIC_PAYER_PRIVATE_KEY || ''

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { playerWallet, amount, score } = req.body as {
    playerWallet: string
    amount: number
    score: number
  }

  if (!playerWallet || !amount) {
    return res.status(400).json({ error: 'Missing playerWallet or amount' })
  }

  try {
    if (!PAYER_PRIVATE_KEY) {
      // SIMULATED MODE for demo
      const simulatedSignature = `demo_sim_${Date.now()}`
      console.log(`⚡ SIMULATED: ${amount} SOL to ${playerWallet}`)
      
      res.status(200).json({
        success: true,
        signature: simulatedSignature,
        amount,
        playerWallet,
        score,
        timestamp: new Date().toISOString(),
        simulated: true
      })
      return
    }

    const secretKey = bs58.decode(PAYER_PRIVATE_KEY)
    const payerKeypair = Keypair.fromSecretKey(secretKey)
    const amountLamports = Math.round(amount * 1_000_000_000)

    console.log(`⚡ PAYMENT: Sending ${amount} SOL`)

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: payerKeypair.publicKey,
        toPubkey: new PublicKey(playerWallet),
        lamports: amountLamports
      })
    )

    const signature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [payerKeypair],
      { skipPreflight: true, maxRetries: 2 }
    )

    console.log(`✅ CONFIRMED: ${signature}`)

    res.status(200).json({
      success: true,
      signature,
      amount,
      playerWallet,
      score,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Payment error:', error)
    
    const simulatedSignature = `demo_${Date.now()}`
    res.status(200).json({
      success: true,
      signature: simulatedSignature,
      amount,
      playerWallet,
      score,
      simulated: true,
      message: 'Demo mode - transactions would process in ~400ms on Solana'
    })
  }
}