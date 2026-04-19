'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, Music } from 'lucide-react';

// Using a long, royalty-free ambient track. The loop attribute will handle replaying.
const musicUrl = 'https://firebasestorage.googleapis.com/v0/b/tutorial-videos-1d544.appspot.com/o/1715396788229-873467__ddmyzik__ambient-music-for-meditation.mp3?alt=media&token=8664b4b2-a4fd-4614-b258-005118f673b5';

export default function AtmosphericMusicPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // This effect is necessary to create the Audio object on the client side only.
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const audio = new Audio(musicUrl);
      audio.loop = true;
      audioRef.current = audio;
    }
  }, []);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Music className="text-accent" />
          Atmosphere
        </CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-center">
        <Button onClick={togglePlayPause} variant="outline" size="lg" className="rounded-full w-16 h-16">
          {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
        </Button>
      </CardContent>
    </Card>
  );
}
