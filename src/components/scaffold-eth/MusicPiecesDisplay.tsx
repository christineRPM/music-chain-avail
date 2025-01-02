'use client'

import { memo } from 'react';
import { Card, CardBody, CardHeader, Button } from "@nextui-org/react";
import { useMusicGame } from '@/hooks/scaffold-eth/useMusicGame';
import { notes } from '@/lib/notes';

interface MusicPiecesDisplayProps {
  playerId: string;
  onPlayPiece?: (notes: number[], timings: number[]) => void;
  onClose?: () => void;
  isPlaying?: boolean;
  activeNote?: number | null;
}

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp * 1000);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  
  return date.toLocaleDateString();
};

const MusicPiecesDisplayComponent: React.FC<MusicPiecesDisplayProps> = ({ 
  playerId, 
  onPlayPiece,
  onClose,
  isPlaying = false,
  activeNote = null
}) => {
  const { musicPieces } = useMusicGame(playerId);

  // Sort pieces by timestamp in descending order (newest first)
  const sortedPieces = [...(musicPieces || [])].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <Card className="h-full bg-white/80 backdrop-blur-sm">
      <CardHeader className="flex justify-between items-center">
        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
          Music History
        </h2>
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        )}
      </CardHeader>
      <CardBody className="space-y-4 overflow-auto">
        {(!sortedPieces || sortedPieces.length === 0) ? (
          <div className="text-center text-gray-500">
            No sequences saved yet. Create your first melody!
          </div>
        ) : (
          <div className="space-y-4">
            {sortedPieces.map((piece) => (
              <Card 
                key={`${piece.title}-${piece.timestamp}`} 
                className="w-full bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 transition-colors"
                shadow="sm"
              >
                <CardBody className="p-4">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-grow">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-purple-900">{piece.title}</h3>
                        {onPlayPiece && (
                          <Button
                            size="sm"
                            color="secondary"
                            variant="flat"
                            onClick={() => onPlayPiece(piece.sequence, piece.timings)}
                            isDisabled={isPlaying}
                            className="min-w-[80px]"
                          >
                            {isPlaying ? '🎵' : '▶️ Play'}
                          </Button>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <p className="text-sm text-gray-600">
                          {formatDate(piece.timestamp)} • {piece.sequence.length} notes
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {piece.sequence.map((noteIndex, i) => (
                            <div
                              key={i}
                              className={`w-7 h-7 rounded-full bg-gradient-to-br ${
                                activeNote === noteIndex ? 'from-purple-600 to-pink-600' : notes[noteIndex].color
                              } flex items-center justify-center text-white text-xs font-medium
                                       shadow-sm hover:shadow-md transition-shadow`}
                              title={notes[noteIndex].note}
                            >
                              {notes[noteIndex].note}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export const MusicPiecesDisplay = memo(MusicPiecesDisplayComponent);
