// src/app/api/music/sequence/route.ts
import { NextResponse } from 'next/server';
import { MusicContract } from '@/lib/scaffold-eth/MusicContract';

interface CreateSequenceRequest {
  playerId: string;
  title: string;
  sequence: number[];
  timings: any; // Add timings property to the interface
}

export async function POST(request: Request) {
  try {
    const { playerId, title, sequence, timings } = await request.json();

    if (!playerId || !title || !sequence || !timings) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const contract = new MusicContract();
    
    // Validate sequence array
    if (!sequence.every(note => Number.isInteger(note) && note >= 0)) {
      return NextResponse.json(
        { error: 'Invalid sequence: must be array of non-negative integers' },
        { status: 400 }
      );
    }

    await contract.createMusicPiece(
      playerId,
      sequence,
      timings,
      title
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving sequence:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to save sequence' },
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
        timings: piece.timings,
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