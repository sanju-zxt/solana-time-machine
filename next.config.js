/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    NEXT_PUBLIC_SOLANA_RPC: 'https://api.devnet.solana.com',
  },
}

module.exports = nextConfig