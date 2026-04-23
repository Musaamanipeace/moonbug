
'use client';

import { useMemo } from 'react';
import MainLayout from '@/components/main-layout';
import CosmicBlueprint from '@/components/cosmic-blueprint';
import GenerationalTime from '@/components/generational-time';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Loader2, Star, Calendar, MapPin } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

type UserEvent = {
  id: string;
  title: string;
  location?: string;
  date?: string;
  authorId: string;
  createdAt: Timestamp;
  highlighted?: boolean;
};

function HighlightedEventsList() {
  const { user } = useUser();
  const firestore = useFirestore();

  const highlightedEventsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(
      collection(firestore, 'users', user.uid, 'events'),
      where('highlighted', '==', true),
      orderBy('createdAt', 'desc')
    );
  }, [user, firestore]);

  const { data: highlightedEvents, isLoading } = useCollection<UserEvent>(highlightedEventsQuery);

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Star className="text-primary"/>
            Highlighted Events
        </CardTitle>
        <CardDescription>Your most important upcoming events.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-24">
            <Loader2 className="h-6 w-6 animate-spin text-accent" />
          </div>
        ) : highlightedEvents && highlightedEvents.length > 0 ? (
          <ul className="space-y-4">
            {highlightedEvents.map(event => (
              <li key={event.id} className="p-3 rounded-lg bg-background/50">
                <h4 className="font-semibold">{event.title}</h4>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
                    {event.date && (
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{format(parseISO(event.date), 'MMMM d, yyyy')}</span>
                        </div>
                    )}
                    {event.location && (
                         <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{event.location}</span>
                        </div>
                    )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            <p>You have no highlighted events.</p>
            <p className="text-xs mt-1">Click the star on an event in the Events tab to highlight it.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function MyMoonPage() {
    return (
        <MainLayout>
            <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
                <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tighter">
                    My Moon
                </h1>
                <p className="text-muted-foreground">Your personal corner of the cosmos.</p>
                <div className="space-y-8 pt-4">
                    <GenerationalTime />
                    <CosmicBlueprint />
                    <HighlightedEventsList />
                </div>
            </div>
        </MainLayout>
    );
}
