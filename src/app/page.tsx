// app/page.tsx
'use client'

import { useState, useRef } from 'react';
import MusicalGame from '@/components/MusicalGame';
import { PlayerSetup } from '@/components/PlayerSetup';
import { PlayerInfo } from '@/types/game';
import { MusicPiecesDisplay } from '@/components/scaffold-eth/MusicPiecesDisplay';

export default function Home() {
  const [playerInfo, setPlayerInfo] = useState<PlayerInfo | null>(null);
  const [showStats, setShowStats] = useState(false);
  const gameRef = useRef<{
    playSequence: (notes: number[]) => Promise<void>;
    isPlaying: boolean;
    activeNote: number | null;
  }>(null);

  const handlePlayPiece = (notes: number[]) => {
    gameRef.current?.playSequence(notes);
  };

  return (
    <main className="min-h-screen h-screen p-8 bg-gradient-to-br from-purple-50 to-pink-50">
      {!playerInfo ? (
        <PlayerSetup onPlayerReady={setPlayerInfo} />
      ) : (
        <div className="flex flex-col md:flex-row gap-8 items-stretch h-full max-w-[1600px] mx-auto relative">
          <div className={`flex-1 ${showStats ? 'hidden md:block' : 'block'}`}>
            <MusicalGame ref={gameRef} playerInfo={playerInfo} />
          </div>
          <div className={`w-full md:w-[400px] ${!showStats ? 'hidden md:block' : 'block'}`}>
            <div className="flex flex-col h-full">
              <div className="md:hidden mb-4">
                <button
                  onClick={() => setShowStats(false)}
                  className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full shadow-lg hover:scale-105 transition-transform"
                >
                  Back to Game
                </button>
              </div>
              <MusicPiecesDisplay 
                playerId={playerInfo.playerId} 
                onPlayPiece={handlePlayPiece}
                isPlaying={gameRef.current?.isPlaying || false}
                activeNote={gameRef.current?.activeNote}
              />
            </div>
          </div>
          <button
            onClick={() => setShowStats(!showStats)}
            className="md:hidden fixed bottom-4 right-4 p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full shadow-lg hover:scale-105 transition-transform"
          >
            {showStats ? '🎮' : '🎵'}
          </button>
        </div>
      )}
    </main>
  );
}