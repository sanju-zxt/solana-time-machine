import { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { score } = req.body

  res.status(200).json({
    message: 'Game session tracked',
    score,
    eligibleForNFT: score >= 50,
    threshold: 50
  })
}