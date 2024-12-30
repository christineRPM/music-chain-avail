// src/contracts/deployedContracts.ts
interface Contracts {
    [chainId: string]: {
      BubbleAchievements: {
        address: string;
      };
    };
  }
  
  const deployedContracts: Contracts = {
    "280": { // zkSync Era testnet chain ID
      BubbleAchievements: {
        address: process.env.CONTRACT_ADDRESS || ""
      }
    }
  };
  
  export default deployedContracts;
  