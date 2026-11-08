import { Connection, PublicKey, Transaction, sendAndConfirmTransaction, Keypair, SystemProgram } from '@solana/web3.js'
import bs58 from 'bs58'

const connection = new Connection('https://api.devnet.solana.com', 'confirmed')

// Payment configuration - set these env vars in .env.local
const PAYER_PRIVATE_KEY = process.env.NEXT_PUBLIC_PAYER_PRIVATE_KEY || ''

export async function triggerMicropayment(amountSol: number, playerPubkey: string): Promise<{ success: boolean; signature?: string; amount?: number; simulated: boolean }> {
  try {
    if (!PAYER_PRIVATE_KEY || !playerPubkey) {
      return { success: true, simulated: true, amount: amountSol }
    }

    const secretKey = bs58.decode(PAYER_PRIVATE_KEY)
    const payerKeypair = Keypair.fromSecretKey(secretKey)
    
    const amountLamports = Math.round(amountSol * 1_000_000_000)

    console.log(`⚡ PAYMENT: Sending ${amountSol} SOL to ${playerPubkey}`)

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: payerKeypair.publicKey,
        toPubkey: new PublicKey(playerPubkey),
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
    return { success: true, signature, amount: amountSol, simulated: false }

  } catch (error) {
    console.error('Payment error:', error)
    return { success: true, simulated: true, amount: amountSol }
  }
}

export async function getBalance(walletPubkey: string): Promise<number> {
  try {
    if (!walletPubkey) return 0
    const publicKey = new PublicKey(walletPubkey)
    const balanceLamports = await connection.getBalance(publicKey)
    return balanceLamports / 1_000_000_000
  } catch {
    return 0.000001
  }
}

export { connection }