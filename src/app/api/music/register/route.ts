// src/app/api/music/register/route.ts
import { NextResponse } from 'next/server';
import { MusicContract } from '@/lib/scaffold-eth/MusicContract';

interface RegisterRequest {
  name: string;
  color: string;
  number: number;
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as RegisterRequest;
    console.log('Register request:', body);

    if (!body.name?.trim()) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const contract = new MusicContract();
    
    try {
      // Generate playerId from name (you might want to add more uniqueness)
      const playerId = body.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      
      // Check if player exists
      const exists = await contract.playerExists(playerId);
      if (exists) {
        // If player exists, just return their ID instead of error
        console.log('Player exists, returning ID:', playerId);
        return NextResponse.json({
          playerId,
          message: 'Welcome back!'
        });
      }

      // Register the player
      await contract.registerPlayer(body.name, playerId);
      
      return NextResponse.json({
        playerId,
        message: 'Player registered successfully'
      });
    } catch (contractError) {
      console.error('Contract error:', contractError);
      return NextResponse.json(
        { error: 'Failed to interact with blockchain' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
}
