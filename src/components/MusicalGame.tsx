'use client'

import React, { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Card, CardBody, CardHeader, Button } from "@nextui-org/react";
import { PlayerInfo } from '@/types/game';
import { useMusicGame } from '@/hooks/scaffold-eth/useMusicGame';
import { notes } from '@/lib/notes';
import toast from 'react-hot-toast';
import { useTurboDA } from '@/hooks/useTurboDA';

interface MusicalGameProps {
  playerInfo: PlayerInfo;
  onToggleStats: () => void;
  showStats: boolean;
  ref?: React.ForwardedRef<{
    playSequence: (notes: number[], timings: number[]) => Promise<void>;
    isPlaying: boolean;
    activeNote: number | null;
  }>;
}

const MusicalGame = forwardRef<{
  playSequence: (notes: number[], timings: number[]) => Promise<void>;
  isPlaying: boolean;
  activeNote: number | null;
}, MusicalGameProps>(({ playerInfo, onToggleStats, showStats }, ref) => {
  const [activeNote, setActiveNote] = useState<number | null>(null);
  const [sequence, setSequence] = useState<number[]>([]);
  const [timeStamps, setTimeStamps] = useState<number[]>([]);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const { saveMusicPiece, musicPieces, refetchMusicPieces } = useMusicGame(playerInfo.playerId);
  const { submitToTurboDA } = useTurboDA();

  useEffect(() => {
    const context = new (window.AudioContext || (window as any).webkitAudioContext)();
    setAudioContext(context);
    return () => {
      if (context) context.close();
    };
  }, []);

  const playSound = useCallback(async (frequency: number) => {
    if (!audioContext) return;

    try {
      // Resume AudioContext if it's suspended (browsers require user interaction)
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);

      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.1);
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.5);

      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.5);

      // Clean up
      setTimeout(() => {
        oscillator.disconnect();
        gainNode.disconnect();
      }, 600);
    } catch (error) {
      console.error('Error playing sound:', error);
      toast.error('Failed to play sound. Please try again.');
    }
  }, [audioContext]);

  const playSequence = useCallback(async (sequenceToPlay: number[] = sequence, timingsToUse: number[] = timeStamps) => {
    if (sequenceToPlay.length === 0 || isPlaying) return;
    
    try {
      setIsPlaying(true);
      for (let i = 0; i < sequenceToPlay.length; i++) {
        const noteIndex = sequenceToPlay[i];
        setActiveNote(noteIndex);
        await playSound(notes[noteIndex].frequency);
        
        if (i < sequenceToPlay.length - 1) {
          // Calculate delay based on timing data
          const currentTime = timingsToUse[i];
          const nextTime = timingsToUse[i + 1];
          const delay = nextTime - currentTime;
          
          // Use a reasonable minimum delay and cap maximum delay
          const actualDelay = Math.max(100, Math.min(delay, 2000));
          await new Promise(resolve => setTimeout(resolve, actualDelay));
        }
        
        setActiveNote(null);
      }
    } catch (error) {
      console.error('Error playing sequence:', error);
      toast.error('Failed to play sequence. Please try again.');
    } finally {
      setIsPlaying(false);
    }
  }, [isPlaying, playSound, sequence, notes]);

  const handleNoteClick = (index: number) => {
    setActiveNote(index);
    playSound(notes[index].frequency);
    const currentTime = Date.now();
    setSequence(prev => [...prev, index]);
    setTimeStamps(prev => [...prev, currentTime]);
    setTimeout(() => setActiveNote(null), 500);
  };

  const handleDeleteNote = (index: number) => {
    setSequence(prev => {
      const newSequence = [...prev];
      newSequence.splice(index, 1);
      return newSequence;
    });
    setTimeStamps(prev => {
      const newTimeStamps = [...prev];
      newTimeStamps.splice(index, 1);
      return newTimeStamps;
    });
  };

  useImperativeHandle(ref, () => ({
    playSequence,
    isPlaying,
    activeNote
  }));

  const handleSave = async () => {
    if (sequence.length === 0) {
      toast.error('Please create a sequence first!');
      return;
    }

    try {
      setIsSaving(true);
      const title = `${playerInfo.name}'s Melody #${musicPieces.length + 1}`;
      
      // Save to zkSync
      await saveMusicPiece(title, sequence, timeStamps);
      
      // Submit to Avail TurboDA
      const turboDAData = JSON.stringify({
        title,
        creator: playerInfo.name,
        sequence,
        timeStamps,
        timestamp: Date.now()
      });
      
      await submitToTurboDA(turboDAData);
      
      await refetchMusicPieces();
      setSequence([]);
      setTimeStamps([]);
      toast.success('Sequence saved successfully!');
    } catch (error) {
      console.error('Error saving sequence:', error);
      toast.error('Failed to save sequence');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClear = () => {
    setSequence([]);
    setTimeStamps([]);
  };

  return (
    <Card className="w-full h-[calc(100vh-4rem)] flex flex-col">
      <CardHeader className="flex-none flex flex-col md:flex-row gap-y-4 justify-between items-center p-4">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
            Musical Chain
          </h1>
          <button
            onClick={onToggleStats}
            className="inline-flex items-center px-2 py-1 text-sm bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full shadow hover:scale-[0.98] transition-transform"
          >
            {showStats ? '🎮' : '🎵'}
          </button>
        </div>
        <div className="flex flex-col md:flex-row w-full md:w-2/3 items-center justify-end gap-4">
          <div className="text-xl text-gray-600">
            Creator: {playerInfo.name}
          </div>
        </div>
      </CardHeader>

      <CardBody className="flex-1 relative">
        <div className="relative w-fit h-96 mx-auto mt-2">
          {/* Note bubbles */}
          {notes.map((note, i) => (
            <div
              key={note.note}
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${note.position.x}px`,
                top: `${note.position.y + 192}px`
              }}
              onClick={() => handleNoteClick(i)}
            >
              <div 
                className={`
                  relative overflow-hidden rounded-full cursor-pointer
                  bg-gradient-to-r ${note.color}
                  transition-all duration-300 ease-out
                  ${activeNote === i ? 'scale-95 z-10' : 'scale-100'}
                  hover:scale-105 hover:brightness-110
                  group w-24 h-24
                `}
              >
                <div 
                  className={`
                    absolute inset-0 opacity-0 group-hover:opacity-50
                    bg-gradient-to-r ${note.color}
                    transition-opacity duration-300 blur-md
                  `}
                />
                {activeNote === i && (
                  <div 
                    className="absolute inset-0 animate-ripple"
                    style={{
                      background: `radial-gradient(circle, ${note.color.split(' ')[1]}00 30%, ${note.color.split(' ')[1]}66 70%)`
                    }}
                  />
                )}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold text-white">
                    {note.note}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Sequence display and controls */}
        <div className="absolute bottom-4 left-0 right-0 flex flex-col items-center gap-4 w-full">
          <div className="flex flex-wrap justify-center gap-2 max-h-52 w-full overflow-y-auto">
            {sequence.map((noteIndex, i) => (
              <div
                key={i}
                className={`
                  relative w-10 h-10 rounded-full 
                  bg-gradient-to-r ${notes[noteIndex].color} 
                  flex items-center justify-center 
                  text-white text-sm
                  group
                `}
              >
                {notes[noteIndex].note}
                <button
                  onClick={() => handleDeleteNote(i)}
                  className="
                    absolute -top-2 -right-2
                    w-5 h-5 rounded-full
                    bg-red-500 text-white
                    flex items-center justify-center
                    text-xs font-bold
                    opacity-0 group-hover:opacity-100
                    transition-opacity duration-200
                    hover:bg-red-600
                    shadow-md
                  "
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <div className="flex justify-center gap-4">
            <Button
              color="primary"
              onClick={() => playSequence()}
              isDisabled={isPlaying || sequence.length === 0}
            >
              {isPlaying ? "Playing..." : "Play"}
            </Button>
            <Button
              color="success"
              onClick={handleSave}
              isDisabled={isSaving || isPlaying || sequence.length === 0}
            >
              {isSaving ? "Saving..." : "Save"}
            </Button>
            <Button
              color="danger"
              onClick={handleClear}
              isDisabled={isPlaying || sequence.length === 0}
            >
              Clear
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
});

MusicalGame.displayName = 'MusicalGame';

export default MusicalGame;