import { useEffect, useState, useCallback, useRef } from 'react';
import { toast } from '@/utils/scaffold-eth';

export interface MusicPiece {
  title: string;
  sequence: number[];
  timestamp: number;
  creator: string;
}

// Poll every 25 seconds
const POLL_INTERVAL = 25000;

export const useMusicGame = (playerId: string) => {
  const [musicPieces, setMusicPieces] = useState<MusicPiece[]>([]);
  const isLoadingRef = useRef(false);
  const lastFetchTime = useRef<number>(0);

  const fetchMusicPieces = useCallback(async (force = false) => {
    const now = Date.now();
    if (!force && now - lastFetchTime.current < POLL_INTERVAL) {
      return; // Skip if not enough time has passed
    }

    if (isLoadingRef.current) return; // Prevent concurrent fetches
    
    try {
      isLoadingRef.current = true;
      const response = await fetch(`/api/music/sequence?playerId=${playerId}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to load music pieces');
      }
      
      setMusicPieces(data.pieces || []);
      lastFetchTime.current = now;
    } catch (error) {
      console.error('Error fetching music pieces:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load music pieces"
      });
    } finally {
      isLoadingRef.current = false;
    }
  }, [playerId]); // Only depend on playerId

  useEffect(() => {
    if (!playerId) return;
    
    // Initial fetch
    fetchMusicPieces(true);

    // Set up polling
    const interval = setInterval(() => {
      fetchMusicPieces();
    }, POLL_INTERVAL);

    return () => clearInterval(interval);
  }, [fetchMusicPieces, playerId]);

  const saveMusicPiece = useCallback(async (title: string, sequence: number[]) => {
    if (!playerId) return;

    try {
      const response = await fetch('/api/music/sequence', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playerId,
          title,
          sequence,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to save music piece');
      }

      toast({
        title: "Success",
        description: "Music piece saved to blockchain"
      });

      // Force immediate fetch after saving
      await fetchMusicPieces(true);
      
      return data;
    } catch (error) {
      console.error('Error saving music piece:', error);
      throw error;
    }
  }, [playerId, fetchMusicPieces]);

  return {
    musicPieces,
    saveMusicPiece,
    refetchMusicPieces: useCallback(() => fetchMusicPieces(true), [fetchMusicPieces]),
    isLoading: isLoadingRef.current
  };
};