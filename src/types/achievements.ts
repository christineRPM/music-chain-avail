// src/types/achievements.ts
export interface Achievement {
    timestamp: string;
    letter: string;
    gameId: string;
    isSpecial: boolean;
  }
  
  export interface ContractAchievement {
    timestamp: bigint;
    letter: string;
    gameId: bigint;
    isSpecial: boolean;
  }