"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Pin } from 'lucide-react';

const STORAGE_KEY = 'lunar-echoes-sticky-note';

export default function StickyNote() {
  const [note, setNote] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load note from localStorage on initial render
  useEffect(() => {
    try {
      const savedNote = localStorage.getItem(STORAGE_KEY);
      if (savedNote) {
        setNote(savedNote);
      }
    } catch (error) {
      console.error("Could not read from localStorage", error);
    }
    setIsLoaded(true);
  }, []);

  // Save note to localStorage when it changes, with debouncing
  useEffect(() => {
    if (!isLoaded) return;

    const handler = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, note);
      } catch (error) {
        console.error("Could not write to localStorage", error);
      }
    }, 500); // Debounce for 500ms

    return () => {
      clearTimeout(handler);
    };
  }, [note, isLoaded]);

  return (
    <Card className="glass-card bg-accent/10 border-accent/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-accent">
          <Pin />
          Sticky Note
        </CardTitle>
        <CardDescription className="text-accent/80">Your thoughts, saved locally in your browser.</CardDescription>
      </CardHeader>
      <CardContent>
        <Textarea
          placeholder="Jot down a cosmic thought..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="h-32 bg-transparent border-accent/50 focus:bg-background/50 text-foreground placeholder:text-accent/60 resize-none font-code"
        />
      </CardContent>
    </Card>
  );
}
