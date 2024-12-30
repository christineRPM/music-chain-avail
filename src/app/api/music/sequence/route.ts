// src/app/api/music/sequence/route.ts
import { NextResponse } from 'next/server';
import { MusicContract } from '@/lib/scaffold-eth/MusicContract';

interface CreateSequenceRequest {
  playerId: string;
  title: string;
  sequence: number[];
}

interface SaveSequenceRequest {
  playerId: string;
  sequence: number[];
  title: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as CreateSequenceRequest;
    console.log('Received request body:', body); // Debug log

    if (!body.playerId || !body.sequence || !Array.isArray(body.sequence)) {
      return NextResponse.json(
        { error: 'Invalid request: missing playerId or sequence' },
        { status: 400 }
      );
    }

    const contract = new MusicContract();
    
    // Validate sequence array
    if (!body.sequence.every(note => Number.isInteger(note) && note >= 0)) {
      return NextResponse.json(
        { error: 'Invalid sequence: must be array of non-negative integers' },
        { status: 400 }
      );
    }

    await contract.createMusicPiece(
      body.playerId,
      body.sequence,
      body.title || `Melody #${Date.now()}`
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error creating sequence:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create sequence' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const playerId = searchParams.get('playerId');

    if (!playerId) {
      return NextResponse.json(
        { error: 'Missing playerId parameter' },
        { status: 400 }
      );
    }

    const contract = new MusicContract();
    const pieces = await contract.getMusicPieces(playerId);

    return NextResponse.json({
      pieces: pieces.map(piece => ({
        title: piece.title,
        sequence: piece.sequence,
        timestamp: piece.timestamp,
        creator: piece.creator
      }))
    });
  } catch (error) {
    console.error('Error fetching sequences:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch sequences' },
      { status: 500 }
    );
  }
}