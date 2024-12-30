/** @type {import('next').NextConfig} */
import * as dotenv from 'dotenv';
dotenv.config();

const nextConfig = {
  reactStrictMode: false,
  env: {
    ZKSYNC_RPC_URL: process.env.ZKSYNC_RPC_URL,
    CONTRACT_ADDRESS: process.env.CONTRACT_ADDRESS,
    MAIN_WALLET_PRIVATE_KEY: process.env.MAIN_WALLET_PRIVATE_KEY,
  },
};

export default nextConfig;