import { NextResponse } from 'next/server';
import { BubbleGameContract } from '@/lib/scaffold-eth/BubbleContract';

interface RegisterRequest {
  name: string;
  favoriteColor: string;
  favoriteNumber: number;
}

export async function POST(req: Request) {
  let requestData: RegisterRequest | undefined;
  
  try {
    requestData = await req.json();
    const { name, favoriteColor, favoriteNumber } = requestData || {};
    
    // Validate inputs
    if (!name || !favoriteColor || favoriteNumber === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const bubbleContract = new BubbleGameContract();
    const { playerId, tx } = await bubbleContract.registerPlayerServerSide(
      name,
      favoriteColor,
      favoriteNumber
    );
    
    return NextResponse.json({ 
      success: true,
      playerId,
      transactionHash: tx.hash
    });
  } catch (error) {
    console.error('Failed to register player:', error);
    
    // If we have the request data and it's valid, return the playerId format even if registration failed
    if (requestData?.name && requestData?.favoriteColor && requestData?.favoriteNumber !== undefined) {
      const playerId = `${requestData.name}-${requestData.favoriteColor}-${requestData.favoriteNumber}`;
      return NextResponse.json({ 
        success: true,
        playerId,
        warning: (error as { shortMessage?: string })?.shortMessage || 'Registration may have failed, but you can still play'
      });
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: (error as { shortMessage?: string })?.shortMessage || 'Failed to register player'
      },
      { status: 500 }
    );
  }
}