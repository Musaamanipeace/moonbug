'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Pin, WifiOff, Loader2 } from 'lucide-react';
import { useUser, useFirestore, useDoc, setDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

interface StickyNoteData {
  content: string;
}

const DEBOUNCE_DELAY = 1000; // 1 second

export default function StickyNote() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [localNote, setLocalNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const stickyNoteRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    // Use a consistent ID for the user's single sticky note
    return doc(firestore, `users/${user.uid}/sticky_notes/main`);
  }, [user, firestore]);

  const { data: remoteNote, isLoading: isNoteLoading } = useDoc<StickyNoteData>(stickyNoteRef);

  // Effect to update local state when remote data changes
  useEffect(() => {
    if (remoteNote) {
      setLocalNote(remoteNote.content);
    }
  }, [remoteNote]);
  
  // Debounced effect to save the note to Firestore
  useEffect(() => {
    // Don't save if the note hasn't changed from what's on the server
    if (!stickyNoteRef || localNote === (remoteNote?.content || '')) {
      return;
    }

    setIsSaving(true);
    const handler = setTimeout(() => {
      setDocumentNonBlocking(stickyNoteRef, { content: localNote }, { merge: true });
      setIsSaving(false);
      setLastSaved(new Date());
    }, DEBOUNCE_DELAY);

    return () => {
      clearTimeout(handler);
    };
  }, [localNote, remoteNote, stickyNoteRef]);

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalNote(e.target.value);
  };
  
  if (isUserLoading) {
    return <Card className="glass-card bg-accent/10 border-accent/50 flex items-center justify-center min-h-[220px]"><Loader2 className="animate-spin text-accent" /></Card>;
  }

  if (!user) {
    return (
      <Card className="glass-card bg-accent/10 border-accent/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-accent">
            <Pin />
            Sticky Note
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center text-center">
            <WifiOff className="w-10 h-10 text-accent/50 mb-2"/>
            <p className="text-sm text-accent/80">Sign in to sync your notes across devices.</p>
        </CardContent>
      </Card>
    );
  }


  return (
    <Card className="glass-card bg-accent/10 border-accent/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-accent">
          <Pin />
          Sticky Note
        </CardTitle>
        <CardDescription className="text-accent/80 h-4">
          {isSaving ? 'Saving...' : lastSaved ? `Saved` : 'Your thoughts, synced to the cloud.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Textarea
          placeholder="Jot down a cosmic thought..."
          value={localNote}
          onChange={handleNoteChange}
          disabled={isNoteLoading}
          className="h-32 bg-transparent border-accent/50 focus:bg-background/50 text-foreground placeholder:text-accent/60 resize-none font-code"
        />
      </CardContent>
    </Card>
  );
}
