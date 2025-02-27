# Music Chain Avail

A decentralized music platform built with Next.js, zkSync Era, and Avail.

🎵 **[Play the Live Demo](https://music-chain-avail.vercel.app/)** 🎵

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- A wallet with some Sepolia ETH for deploying to zkSync Era testnet

### Getting Testnet ETH

To get testnet ETH for zkSync Era Sepolia, you can use any of these faucets:

| Faucet | Daily Amount | Requirements |
|--------|--------------|--------------|
| [Chainstack](https://faucet.chainstack.com/zksync-testnet-faucet) | 0.05 ETH | Chainstack API key |
| [thirdweb](https://thirdweb.com/zksync-sepolia-testnet) | 0.1 ETH | Connect wallet |
| [LearnWeb3](https://learnweb3.io/faucets/zksync_sepolia/) | 0.01 ETH | GitHub auth |
| [Alchemy](https://www.alchemy.com/faucets/zksync-sepolia) | 0.1 ETH | Alchemy account |

Alternatively, you can:
1. Get Sepolia ETH from a Sepolia faucet
2. Bridge it to zkSync Era Sepolia using the [zkSync Bridge](https://bridge.zksync.io/)

## Data Availability with TurboDA

This project uses Avail's TurboDA service to ensure data availability for all music pieces created on the platform. When a user creates a music sequence:

1. The transaction is sent to zkSync Era for execution
2. The music data is simultaneously submitted to Avail's TurboDA service
3. TurboDA provides fast and efficient data availability guarantees through Avail's data availability layer

### Key Benefits of TurboDA

- **Ultra-Fast Confirmations**: ~250ms soft confirmation times, providing near-instant verification of data availability
- **Submission Guarantees**: Receive a submission ID immediately as proof that your data will be posted to the network
- **Enhanced Throughput**: 
  - Automatically parallelizes multiple submissions
  - Process several transactions in a single 60-second window
  - Bypasses the standard DA 512kb per-transaction cap
  - No need to wait for sequential transaction processing

This dual-submission approach ensures:
- Fast transaction execution on zkSync Era
- Robust data availability through Avail
- Verifiable proof that music data is available on the network
- Minimal latency for user interactions

The implementation uses a secure server-side API route to handle TurboDA submissions, protecting API credentials while maintaining high performance.

## Setup Instructions

1. Install dependencies:
```bash
npm install
# or
yarn install
```

2. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Add your wallet's private key to `MAIN_WALLET_PRIVATE_KEY`
```bash
cp .env.example .env
```

## Deploy Smart Contract

1. Deploy the smart contract to zkSync Era testnet:
```bash
npm run deploy
# or
yarn deploy
```

2. After successful deployment, you'll see the contract address in the console output. Copy this address.

3. Update your `.env` file with the contract address:
```env
CONTRACT_ADDRESS=<your-contract-address>
```

## Running the Application

1. Start the development server:
```bash
npm run dev
# or
yarn dev
```

2. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Environment Variables

Make sure your `.env` file has the following variables set:

```env
ZKSYNC_RPC_URL=https://sepolia.era.zksync.dev
AVAIL_LC_URL=https://api.lightclient.turing.avail.so/v1
MAIN_WALLET_PRIVATE_KEY=<your-wallet-private-key>
CONTRACT_ADDRESS=<deployed-contract-address>
```

## Technology Stack

- [Next.js](https://nextjs.org/) - React framework
- [zkSync Era](https://zksync.io/) - Layer 2 scaling solution
- [Avail](https://www.availproject.org/) - Data availability layer
- [Hardhat](https://hardhat.org/) - Development environment
- [ethers.js](https://docs.ethers.org/) - Ethereum library

## Running Your Own Avail Light Client

To enhance decentralization and improve your application's performance, you can run your own Avail Light Client. The Light Client helps verify data availability and maintains a connection to the Avail network.

### Quick Start

The easiest way to run an Avail Light Client is using `availup`:

```bash
curl -sL1 avail.sh | bash
```

For detailed instructions on running a Light Client, including:
- Different installation methods (pre-built binaries, building from source)
- Configuration options
- Running in app-client mode
- Setting up identity

Visit the [Avail Light Client Documentation](https://docs.availproject.org/docs/operate-a-node/run-a-light-client/0010-light-client).

## Learn More

- [zkSync Documentation](https://era.zksync.io/docs/)
- [Avail Documentation](https://docs.availproject.org/)
- [Next.js Documentation](https://nextjs.org/docs)


## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Architecture Note

For workshop/demonstration purposes, this implementation uses a simplified architecture where:

1. Transactions are sent to zkSync Era for execution
2. Data is separately submitted to Avail's TurboDA service for data availability

In a production environment, these would typically be integrated at the protocol level, with zkSync Era automatically handling data availability through Avail. However, for learning purposes and time constraints, we're using TurboDA's API directly:

```bash
curl --location --request POST 'https://staging.turbo-api.availproject.org/v1/submit_raw_data' \
--header 'x-api-key: YOUR_API_KEY' \
--header 'Content-Type: application/octet-stream' \
--data-binary 'your_data'
```

Example response:
```json
{
  "id": "submission_id",
  "status": "success"
}
```

The implementation:
1. Sends music piece data to TurboDA via a secure server-side API route
2. Uses proper binary data submission with `application/octet-stream`
3. Authenticates using the TurboDA API key
4. Receives immediate confirmation of data submission

This separation allows us to demonstrate both systems' functionality without requiring a full protocol-level integration, while still maintaining proper data availability guarantees through Avail's TurboDA service.
