import { HardhatUserConfig } from "hardhat/config";
import "@matterlabs/hardhat-zksync-solc";
import "@matterlabs/hardhat-zksync-deploy";
import "@nomicfoundation/hardhat-ethers";
import * as dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  zksolc: {
    version: "latest",
    settings: {},
  },
  defaultNetwork: "zkSyncTestnet",
  networks: {
    zkSyncTestnet: {
      url: process.env.ZKSYNC_RPC_URL,
      ethNetwork: "sepolia",
      zksync: true,
    }
  },
  solidity: {
    version: "0.8.17",
  },
  paths: {
    sources: "./src/contracts",
    cache: "./cache",
    artifacts: "./src/contracts/abis"
  },
};

export default config;