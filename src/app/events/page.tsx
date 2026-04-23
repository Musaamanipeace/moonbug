'use client';

import { useState, useMemo, useCallback } from 'react';
import MainLayout from '@/components/main-layout';
import EventsCatalogue from '@/components/events-catalogue';
import { useUser, useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking, deleteDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, serverTimestamp, Timestamp, doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { PlusCircle, Loader2, Calendar, MapPin, Bell, Trash2, XIcon, AlarmClock, Star } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
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
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { format, formatDistanceToNow, isFuture, parseISO } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { textToSpeech } from '@/ai/flows/text-to-speech-flow';

type UserEvent = {
  id: string;
  title: string;
  location?: string;
  date?: string;
  authorId: string;
  createdAt: Timestamp;
  notificationTime?: string;
  notificationVoice?: string;
  highlighted?: boolean;
};

const eventFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  location: z.string().optional(),
  date: z.string().optional(),
});

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

function UserEventCard({ event, onDelete, onSetNotification }: { event: UserEvent; onDelete: (id: string) => void; onSetNotification: (event: UserEvent, values: z.infer<typeof notificationFormSchema>) => void; }) {
  const [isNotificationDialogOpen, setIsNotificationDialogOpen] = useState(false);
  const form = useForm<z.infer<typeof notificationFormSchema>>({
    resolver: zodResolver(notificationFormSchema),
    defaultValues: { notificationTime: '', notificationVoice: 'Algenib' },
  });

  const hasActiveNotification = event.notificationTime && isFuture(parseISO(event.notificationTime));
  const firestore = useFirestore();

  const handleCancelNotification = () => {
    if (!firestore) return;
    const eventRef = doc(firestore, `users/${event.authorId}/events/${event.id}`);
    setDocumentNonBlocking(eventRef, { notificationTime: null, notificationVoice: null }, { merge: true });
  };
  
  const onSubmitNotification = (values: z.infer<typeof notificationFormSchema>) => {
    onSetNotification(event, values);
    setIsNotificationDialogOpen(false);
    form.reset();
  };

  const handleToggleHighlight = () => {
    if (!firestore) return;
    const eventRef = doc(firestore, `users/${event.authorId}/events/${event.id}`);
    setDocumentNonBlocking(eventRef, { highlighted: !event.highlighted }, { merge: true });
  };

  return (
    <Card className="glass-card flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle>{event.title}</CardTitle>
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={handleToggleHighlight}>
              <Star className={cn("h-5 w-5", event.highlighted ? "text-primary fill-primary" : "text-muted-foreground")} />
            </Button>
            <Dialog open={isNotificationDialogOpen} onOpenChange={setIsNotificationDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon"><Bell className="h-5 w-5" /></Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Set Reminder for "{event.title}"</DialogTitle>
                  <DialogDescription>Get a timed audio reminder for this event.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmitNotification)} className="space-y-4">
                    <FormField control={form.control} name="notificationTime" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reminder Time</FormLabel>
                        <FormControl><Input type="datetime-local" {...field} /></FormControl>
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
                          <SelectContent>{voices.map(v => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}</SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <DialogFooter><Button type="submit">Set Notification</Button></DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        {event.createdAt && <CardDescription>Created {formatDistanceToNow(event.createdAt.toDate(), { addSuffix: true })}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-2 text-sm flex-grow">
        {event.date && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{format(parseISO(event.date), 'MMMM d, yyyy')}</span>
          </div>
        )}
        {event.location && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{event.location}</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between items-center">
         {hasActiveNotification ? (
            <div className="flex items-center gap-2 text-xs text-accent bg-accent/10 p-2 rounded-md">
              <AlarmClock className="h-4 w-4" />
              <span>Reminder: {format(parseISO(event.notificationTime!), 'h:mm a')}</span>
              <Button variant="ghost" size="icon" className="h-6 w-6 text-accent" onClick={handleCancelNotification}>
                <XIcon className="h-4 w-4" />
              </Button>
            </div>
         ) : <div />}
        <Button variant="destructive" size="icon" onClick={() => onDelete(event.id)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function EventsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const eventsCollectionRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, 'users', user.uid, 'events');
  }, [user, firestore]);

  const eventsQuery = useMemoFirebase(() => {
    if (!eventsCollectionRef) return null;
    return query(eventsCollectionRef, orderBy('createdAt', 'desc'));
  }, [eventsCollectionRef]);

  const { data: userEvents, isLoading: isLoadingEvents } = useCollection<UserEvent>(eventsQuery);

  const form = useForm<z.infer<typeof eventFormSchema>>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: { title: '', location: '', date: '' },
  });

  const { formState: { isSubmitting } } = form;

  const onEventSubmit = (values: z.infer<typeof eventFormSchema>) => {
    if (!user || !eventsCollectionRef) {
      toast({
        variant: "destructive",
        title: "Sign In Required",
        description: "You must be signed in to save an event. Please go to the Profile page to sign in or create an account.",
      });
      setIsDialogOpen(false); // Close the dialog
      return;
    }
    addDocumentNonBlocking(eventsCollectionRef, {
      ...values,
      authorId: user.uid,
      createdAt: serverTimestamp(),
      highlighted: false,
    });
    toast({ title: 'Event Created!', description: 'Your new event has been saved.' });
    form.reset();
    setIsDialogOpen(false);
  };
  
  const onDeleteEvent = (id: string) => {
    if (!eventsCollectionRef) return;
    deleteDocumentNonBlocking(doc(eventsCollectionRef, id));
    toast({ title: 'Event Deleted', variant: 'destructive' });
  };

  const onSetNotification = useCallback(async (event: UserEvent, values: z.infer<typeof notificationFormSchema>) => {
    if (!firestore) return;
    const eventRef = doc(firestore, `users/${event.authorId}/events/${event.id}`);
    const notificationData = {
      notificationTime: new Date(values.notificationTime).toISOString(),
      notificationVoice: values.notificationVoice,
    };
    setDocumentNonBlocking(eventRef, notificationData, { merge: true });
    
    // --- Schedule client-side alarm ---
    const alarmTime = new Date(notificationData.notificationTime);
    const now = new Date();
    if (isFuture(alarmTime)) {
      const timeoutDuration = alarmTime.getTime() - now.getTime();
      setTimeout(async () => {
        toast({ title: "Event Reminder!", description: event.title, duration: 10000 });
        if (Notification.permission === 'granted') {
          new Notification('Moonbug Event Reminder', { body: event.title });
        }
        try {
          const result = await textToSpeech({ text: event.title, voice: values.notificationVoice });
          const audio = new Audio(result.audioDataUri);
          audio.play();
        } catch(e) { console.error(e) }

        // Clear notification from DB after it fires
        setDocumentNonBlocking(eventRef, { notificationTime: null, notificationVoice: null }, { merge: true });
      }, timeoutDuration);
    }
    
    toast({ title: 'Reminder Set!', description: `For "${event.title}" at ${format(alarmTime, 'h:mm a')}.` });
  }, [firestore, toast]);
  

  return (
    <MainLayout>
      <div className="flex-1 space-y-8 p-4 md:p-8 pt-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tighter">Events</h1>
            <p className="text-muted-foreground mt-1">Explore global happenings and manage your personal events.</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button><PlusCircle />Create Event</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create a New Event</DialogTitle>
                <DialogDescription>Add a personal event to your collection.</DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onEventSubmit)} className="space-y-4">
                  <FormField control={form.control} name="title" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl><Input placeholder="e.g., Doctor's Appointment" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="location" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location (Optional)</FormLabel>
                      <FormControl><Input placeholder="e.g., 123 Cosmic Lane or Online" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="date" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date (Optional)</FormLabel>
                      <FormControl><Input type="date" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <DialogFooter>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting && <Loader2 className="animate-spin" />} Save Event
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
        <Tabs defaultValue="my-events" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="my-events">My Events</TabsTrigger>
            <TabsTrigger value="global-events">Global Events</TabsTrigger>
          </TabsList>
          <TabsContent value="my-events">
            {!user ? (
              <Card className="glass-card text-center mt-4">
                <CardContent className="p-6">
                  <p className="text-muted-foreground">Sign in to create and manage your personal events.</p>
                </CardContent>
              </Card>
            ) : isLoadingEvents ? (
              <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-accent" /></div>
            ) : userEvents && userEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                {userEvents.map(event => (
                  <UserEventCard key={event.id} event={event} onDelete={onDeleteEvent} onSetNotification={onSetNotification} />
                ))}
              </div>
            ) : (
              <Card className="glass-card text-center mt-4">
                <CardContent className="p-6">
                  <p className="text-muted-foreground">You haven't created any events yet.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          <TabsContent value="global-events">
            <div className="mt-4">
              <EventsCatalogue showFooter={false}/>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
