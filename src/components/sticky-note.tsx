'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Pin, WifiOff, Loader2, BellPlus, AlarmClock, XIcon } from 'lucide-react';
import { useUser, useFirestore, useDoc, setDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { textToSpeech } from '@/ai/flows/text-to-speech-flow';
import { format, parseISO, isFuture } from 'date-fns';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

interface StickyNoteData {
  content: string;
  updatedAt?: any;
  notificationTime?: string;
  notificationVoice?: string;
}

const notificationFormSchema = z.object({
  notificationTime: z.string().refine(val => val && isFuture(new Date(val)), {
    message: 'Please select a future date and time.',
  }),
  notificationVoice: z.string(),
});

const voices = [
  { id: 'Algenib', name: 'Algenib (Calm Female)' },
  { id: 'Achernar', name: 'Achernar (Warm Male)' },
  { id: 'Enif', name: 'Enif (Gentle Female)' },
];

const DEBOUNCE_DELAY = 1000;

export default function StickyNote() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [localNote, setLocalNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const { toast } = useToast();

  const [isNotificationDialogOpen, setIsNotificationDialogOpen] = useState(false);
  const [isNotificationPlaying, setIsNotificationPlaying] = useState(false);
  const alarmTimeout = useRef<NodeJS.Timeout | null>(null);

  const stickyNoteRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, `users/${user.uid}/sticky_notes/main`);
  }, [user, firestore]);

  const { data: remoteNote, isLoading: isNoteLoading } = useDoc<StickyNoteData>(stickyNoteRef);

  const form = useForm<z.infer<typeof notificationFormSchema>>({
    resolver: zodResolver(notificationFormSchema),
    defaultValues: {
      notificationTime: '',
      notificationVoice: 'Algenib',
    },
  });

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission();
      }
    }
  }, []);

  const scheduleAlarm = useCallback((time: string, voice: string, content: string) => {
    if (alarmTimeout.current) clearTimeout(alarmTimeout.current);
    const alarmTime = new Date(time);
    const now = new Date();

    if (isFuture(alarmTime)) {
      const timeoutDuration = alarmTime.getTime() - now.getTime();
      alarmTimeout.current = setTimeout(async () => {
        setIsNotificationPlaying(true);
        toast({
          title: 'Moonbug Reminder!',
          description: 'Playing your note reminder audio.',
          duration: 10000,
        });
        
        if (Notification.permission === 'granted' && content) {
          new Notification('Moonbug Reminder', {
            body: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
            icon: '/favicon.ico',
          });
        }
        
        try {
          if (content) {
            const result = await textToSpeech({ text: content, voice: voice });
            const audio = new Audio(result.audioDataUri);
            audio.play();
            audio.onended = () => setIsNotificationPlaying(false);
          }
        } catch (e) {
          console.error('Failed to play notification sound', e);
          setIsNotificationPlaying(false);
        }

        if (stickyNoteRef) {
          updateDoc(stickyNoteRef, {
            notificationTime: null,
            notificationVoice: null,
          }).catch(error => {
              errorEmitter.emit('permission-error', new FirestorePermissionError({
                  path: stickyNoteRef.path,
                  operation: 'update',
                  requestResourceData: { notificationTime: null, notificationVoice: null }
              }))
          });
        }
      }, timeoutDuration);
    }
  }, [stickyNoteRef, toast]);
  
  useEffect(() => {
    if (remoteNote?.notificationTime && isFuture(parseISO(remoteNote.notificationTime)) && remoteNote.content) {
      scheduleAlarm(remoteNote.notificationTime, remoteNote.notificationVoice || 'Algenib', remoteNote.content);
    }
  }, [remoteNote?.notificationTime, remoteNote?.content, remoteNote?.notificationVoice, scheduleAlarm]);

  useEffect(() => {
    if (remoteNote && remoteNote.content !== localNote) {
      setLocalNote(remoteNote.content);
    }
  }, [remoteNote]);
  
  useEffect(() => {
    if (!stickyNoteRef || localNote === (remoteNote?.content || '')) {
      return;
    }

    setIsSaving(true);
    const handler = setTimeout(() => {
      setDocumentNonBlocking(stickyNoteRef, { content: localNote, updatedAt: serverTimestamp() }, { merge: true });
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

  const handleSetNotification = (values: z.infer<typeof notificationFormSchema>) => {
    if (!stickyNoteRef) return;
    
    const notificationData = {
      notificationTime: new Date(values.notificationTime).toISOString(),
      notificationVoice: values.notificationVoice,
    };

    setDocumentNonBlocking(stickyNoteRef, notificationData, { merge: true });
    
    if (localNote) {
        scheduleAlarm(notificationData.notificationTime, notificationData.notificationVoice, localNote);
    }
    
    toast({
      title: 'Notification Set!',
      description: `You'll be reminded on ${format(new Date(values.notificationTime), 'MMM d, yyyy @ h:mm a')}.`,
    });
    
    setIsNotificationDialogOpen(false);
    form.reset();
  };
  
  const handleCancelNotification = () => {
    if (alarmTimeout.current) clearTimeout(alarmTimeout.current);
    if (stickyNoteRef) {
      updateDoc(stickyNoteRef, {
        notificationTime: null,
        notificationVoice: null,
      }).catch(error => {
          errorEmitter.emit('permission-error', new FirestorePermissionError({
              path: stickyNoteRef.path,
              operation: 'update',
              requestResourceData: { notificationTime: null, notificationVoice: null }
          }))
      });
    }
    toast({ title: 'Notification Canceled' });
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

  const hasActiveNotification = remoteNote?.notificationTime && isFuture(parseISO(remoteNote.notificationTime));

  return (
    <Card className="glass-card bg-accent/10 border-accent/50">
      <CardHeader>
        <div className="flex justify-between items-start">
            <div className="flex-1">
                <CardTitle className="flex items-center gap-2 text-accent">
                    <Pin />
                    Sticky Note
                </CardTitle>
                <CardDescription className="text-accent/80 h-4">
                     {isSaving ? 'Saving...' : (lastSaved && remoteNote?.updatedAt) ? `Saved` : 'Your thoughts, synced to the cloud.'}
                </CardDescription>
            </div>
            <Dialog open={isNotificationDialogOpen} onOpenChange={setIsNotificationDialogOpen}>
                <DialogTrigger asChild>
                     <Button variant="ghost" size="icon" className="text-accent/80 hover:bg-accent/20 hover:text-accent -mt-2 -mr-2">
                        <BellPlus className="h-5 w-5" />
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Set a Reminder</DialogTitle>
                        <DialogDescription>Get a timed audio reminder for this note.</DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSetNotification)} className="space-y-4">
                            <FormField control={form.control} name="notificationTime" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Reminder Time</FormLabel>
                                    <FormControl>
                                        <Input type="datetime-local" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="notificationVoice" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Reminder Voice</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger><SelectValue placeholder="Select a voice" /></SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {voices.map(v => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />
                             <DialogFooter>
                                <Button type="submit" disabled={!localNote}>Set Notification</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
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
      {hasActiveNotification && (
          <CardFooter className="flex justify-between items-center bg-accent/10 p-3">
              <div className="flex items-center gap-2 text-xs text-accent">
                  <AlarmClock className="h-4 w-4" />
                  <span>Reminder set for {format(parseISO(remoteNote.notificationTime!), 'h:mm a')}</span>
              </div>
              <Button variant="ghost" size="icon" className="h-6 w-6 text-accent" onClick={handleCancelNotification}>
                  <XIcon className="h-4 w-4" />
              </Button>
          </CardFooter>
      )}
       {isNotificationPlaying && (
           <CardFooter className="flex justify-center items-center bg-accent/20 p-3">
              <p className="text-sm text-accent animate-pulse">Playing reminder...</p>
          </CardFooter>
      )}
    </Card>
  );
}
