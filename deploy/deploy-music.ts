import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Deployer } from "@matterlabs/hardhat-zksync-deploy";
import { Wallet, Provider } from "zksync-ethers";
import * as dotenv from "dotenv";

dotenv.config();

export default async function (hre: HardhatRuntimeEnvironment) {
  const provider = new Provider(process.env.ZKSYNC_RPC_URL);
  const wallet = new Wallet(process.env.MAIN_WALLET_PRIVATE_KEY!, provider);
  const deployer = new Deployer(hre, wallet);

  const artifact = await deployer.loadArtifact("MusicSequence");
  
  console.log("Deploying MusicSequence...");
  const contract = await deployer.deploy(artifact);
  const address = await contract.getAddress();

  console.log(`MusicSequence deployed to: ${address}`);

  return { contract, address };
}