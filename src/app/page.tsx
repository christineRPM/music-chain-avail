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
    <main className="min-h-[100dvh] h-[100dvh] p-0 md:p-8 bg-gradient-to-br from-purple-50 to-pink-50">
      {!playerInfo ? (
        <PlayerSetup onPlayerReady={setPlayerInfo} />
      ) : (
        <div className="flex flex-col md:flex-row md:gap-8 items-stretch h-full max-w-[1600px] mx-auto relative pb-16 md:pb-0 overflow-y-auto">
          <div className="w-full">
            <div className={`flex-1 ${showStats ? 'hidden md:block' : 'block'}`}>
              <MusicalGame ref={gameRef} playerInfo={playerInfo} onToggleStats={() => setShowStats(!showStats)} showStats={showStats} />
            </div>
          </div>
          <div className={`w-full md:w-[400px] ${!showStats ? 'hidden md:block' : 'block'}`}>
            <div className="flex flex-col h-full">
              <MusicPiecesDisplay 
                playerId={playerInfo.playerId} 
                onPlayPiece={handlePlayPiece}
                onClose={() => setShowStats(false)}
                isPlaying={gameRef.current?.isPlaying || false}
                activeNote={gameRef.current?.activeNote}
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}