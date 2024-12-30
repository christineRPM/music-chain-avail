import { Wallet, Provider, Contract } from "zksync-ethers";
import MusicSequenceArtifact from "@/contracts/abis-zk/src/contracts/MusicSequence.sol/MusicSequence.json";

const MusicSequenceABI = MusicSequenceArtifact.abi;

interface PlayerData {
  name: string;
  isActive: boolean;
  sequencePosition: bigint;
}

interface MusicPieceEvent {
  args: {
    id: bigint;
    creator: string;
  };
}

export interface MusicPiece {
  creator: string;
  sequence: number[];
  title: string;
  timestamp: number;
}

export class MusicContract {
  private contract: Contract;
  private provider: Provider;
  private wallet: Wallet;
  
  constructor() {
    const rpcUrl = process.env.ZKSYNC_RPC_URL;
    const privateKey = process.env.MAIN_WALLET_PRIVATE_KEY;
    const contractAddress = process.env.CONTRACT_ADDRESS;

    if (!rpcUrl) throw new Error('Missing ZKSYNC_RPC_URL');
    if (!privateKey) throw new Error('Missing MAIN_WALLET_PRIVATE_KEY');
    if (!contractAddress) throw new Error('Missing CONTRACT_ADDRESS');

    try {
      // Initialize provider with retry logic
      const initProvider = async () => {
        try {
          this.provider = new Provider(rpcUrl);
          await this.provider.getNetwork(); // Test the connection
          return this.provider;
        } catch (error) {
          console.error('Provider initialization failed, retrying...', error);
          await new Promise(resolve => setTimeout(resolve, 1000));
          return initProvider();
        }
      };

      // Initialize provider synchronously for constructor
      this.provider = new Provider(rpcUrl);
      
      this.wallet = new Wallet(privateKey, this.provider);
      this.contract = new Contract(
        contractAddress,
        MusicSequenceABI,
        this.wallet
      );

      // Start async initialization
      initProvider().then(provider => {
        this.provider = provider;
        this.wallet = new Wallet(privateKey, provider);
        this.contract = new Contract(
          contractAddress,
          MusicSequenceABI,
          this.wallet
        );
      }).catch(error => {
        console.error('Failed to initialize provider after retries:', error);
      });

    } catch (error) {
      console.error('Contract initialization error:', error);
      throw error;
    }
  }

  private getWallet(): Wallet {
    return this.wallet;
  }

  private async ensureProvider(): Promise<void> {
    try {
      await this.provider.getNetwork();
    } catch (error) {
      console.error('Provider check failed, reinitializing...', error);
      this.provider = new Provider(process.env.ZKSYNC_RPC_URL!);
      this.wallet = new Wallet(process.env.MAIN_WALLET_PRIVATE_KEY!, this.provider);
      this.contract = new Contract(
        process.env.CONTRACT_ADDRESS!,
        MusicSequenceABI,
        this.wallet
      );
    }
  }

  private convertSequenceToNumbers(sequence: any): number[] {
    if (!sequence) return [];
    
    // If sequence is already a BigInt array from contract
    if (Array.isArray(sequence) && sequence.length > 0 && typeof sequence[0] === 'bigint') {
      return sequence.map(note => Number(note));
    }
    
    // Handle array-like objects
    if (typeof sequence === 'object' && 'length' in sequence) {
      return Array.from({ length: sequence.length }, (_, i) => Number(sequence[i] || 0));
    }
    
    // Handle plain arrays
    if (Array.isArray(sequence)) {
      return sequence.map(note => Number(note || 0));
    }
    
    console.warn('Unknown sequence format:', sequence);
    return [];
  }

  async playerExists(playerId: string): Promise<boolean> {
    try {
      await this.ensureProvider();
      console.log('Checking if player exists:', playerId);
      const result = await this.contract.players(playerId) as PlayerData;
      console.log('Player data:', result);
      return result.isActive;
    } catch (error) {
      console.error('Error checking player existence:', error);
      throw error;
    }
  }

  async registerPlayer(name: string, playerId: string): Promise<string> {
    try {
      await this.ensureProvider();
      console.log('Registering player:', { name, playerId });
      const tx = await this.contract.registerPlayer(name, playerId);
      console.log('Registration transaction sent:', tx.hash);
      const receipt = await tx.wait();
      console.log('Registration complete:', receipt);
      return playerId;
    } catch (error) {
      console.error('Error registering player:', error);
      throw error;
    }
  }

  async getMusicPieces(playerId: string): Promise<MusicPiece[]> {
    try {
      await this.ensureProvider();
      console.log('Getting music pieces for player:', playerId);
      
      // Get all events and filter by creator in memory
      const filter = this.contract.filters.MusicPieceCreated();
      const events = await this.contract.queryFilter(filter);
      console.log('Found events:', events);
      
      const pieces = await Promise.all(
        events
          .filter((event: any) => {
            console.log('Checking event:', event);
            return event.args?.creator?.toLowerCase() === playerId.toLowerCase();
          })
          .map(async (event) => {
            try {
              const log = event as any;
              if (!log.args?.id) {
                console.error('Invalid event log:', log);
                return null;
              }

              // Call getMusicPiece instead of accessing musicPieces mapping directly
              const [creator, notes, title, timestamp] = await this.contract.getMusicPiece(log.args.id);
              console.log('Raw piece data:', {
                creator,
                notes: notes.map((n: bigint) => Number(n)),
                title,
                timestamp: Number(timestamp)
              });

              return {
                title: title || '',
                sequence: notes.map((n: bigint) => Number(n)),
                timestamp: Number(timestamp || 0),
                creator: creator || ''
              };
            } catch (error) {
              console.error('Error processing piece:', error);
              return null;
            }
          })
      );

      const validPieces = pieces.filter((piece): piece is MusicPiece => piece !== null);
      console.log('Final pieces:', validPieces);
      return validPieces;
    } catch (error) {
      console.error('Error getting music pieces:', error);
      throw error;
    }
  }

  async createMusicPiece(creator: string, sequence: number[], title: string): Promise<unknown> {
    try {
      await this.ensureProvider();
      console.log('Creating music piece:', { creator, sequence, title });
      
      const sequenceForContract = sequence.map(note => BigInt(note));
      
      const tx = await this.contract.createMusicPiece(creator, sequenceForContract, title);
      console.log('Transaction sent:', tx.hash);
      
      const receipt = await tx.wait();
      console.log('Transaction receipt:', receipt);

      const event = receipt.logs.find((log: any) => 
        log.fragment?.name === "MusicPieceCreated"
      );

      if (!event) {
        throw new Error("Failed to create music piece: Event not found");
      }

      return event;
    } catch (error) {
      console.error('Contract error:', error);
      throw error;
    }
  }
}