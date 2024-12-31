// components/PlayerSetup.tsx
import React, { useState } from 'react';
import { Card, CardBody, CardHeader, Input, Button } from "@nextui-org/react";
import { PlayerInfo } from '@/types/game';
import { toast } from '@/utils/scaffold-eth';

interface PlayerSetupProps {
  onPlayerReady: (player: PlayerInfo) => void;
}

interface ColorOption {
  name: string;
  value: string;
  class: string;
}

const COLORS: ColorOption[] = [
  { name: 'Red', value: 'red', class: 'bg-red-400 hover:bg-red-500' },
  { name: 'Blue', value: 'blue', class: 'bg-blue-400 hover:bg-blue-500' },
  { name: 'Purple', value: 'purple', class: 'bg-purple-400 hover:bg-purple-500' },
  { name: 'Pink', value: 'pink', class: 'bg-pink-400 hover:bg-pink-500' },
  { name: 'Green', value: 'green', class: 'bg-green-400 hover:bg-green-500' }
];

const NUMBERS: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];

export const PlayerSetup: React.FC<PlayerSetupProps> = ({ onPlayerReady }) => {
  const [name, setName] = useState<string>('');
  const [color, setColor] = useState<string>('');
  const [number, setNumber] = useState<number | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !color || !number || isRegistering) return;

    try {
      setIsRegistering(true);
      const response = await fetch('/api/music/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          favoriteColor: color,
          favoriteNumber: number
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to register');
      }

      onPlayerReady({
        name: name.trim(),
        color,
        number,
        playerId: data.playerId
      });

      // Show appropriate toast message
      toast({
        title: "Success",
        description: data.message || 'Welcome to Music Chain!'
      });
    } catch (error) {
      console.error('Error registering player:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to register'
      });
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-3xl bg-white/80 backdrop-blur-sm">
        <CardHeader className="flex justify-center p-5">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
            Music Sequencer!
          </h1>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-center">What's your name?</h2>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="max-w-xs mx-auto"
                isDisabled={isRegistering}
              />
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-bold text-center">Pick your favorite color</h2>
              <div className="flex flex-wrap justify-center gap-2">
                {COLORS.map((colorOption) => (
                  <Button
                    key={colorOption.value}
                    className={`${colorOption.class} text-white ${
                      color === colorOption.value ? 'ring-4 ring-offset-2' : ''
                    }`}
                    onClick={() => setColor(colorOption.value)}
                    isDisabled={isRegistering}
                  >
                    {colorOption.name}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-bold text-center">Choose your lucky number</h2>
              <div className="flex flex-wrap justify-center gap-2">
                {NUMBERS.map((num) => (
                  <Button
                    key={num}
                    className={`bg-gray-200 hover:bg-gray-300 ${
                      number === num ? 'ring-4 ring-offset-2 ring-purple-500' : ''
                    }`}
                    onClick={() => setNumber(num)}
                    isDisabled={isRegistering}
                  >
                    {num}
                  </Button>
                ))}
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-center">
                {error}
              </div>
            )}

            <div className="flex space-y-4 items-center">
              <Button
                type="submit"
                color="secondary"
                className="w-full max-w-xs mx-auto bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                isLoading={isRegistering}
                isDisabled={!name.trim() || !color || !number || isRegistering}
              >
                {isRegistering ? "Registering..." : "Start Playing"}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
};