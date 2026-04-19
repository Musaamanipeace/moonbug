
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { defaultEvents } from '@/lib/events';
import { format, parseISO } from 'date-fns';
import { Sparkles, Calendar, Search, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { findEvents, type FindEventsOutput } from '@/ai/flows/find-events-flow';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getLunarDate, countNewMoonsSince } from '@/lib/moon-utils';

function TodayInLunar() {
    const [lunarInfo, setLunarInfo] = useState<{ totalMoons: number; dayOfCycle: number } | null>(null);

    useEffect(() => {
        // This effect runs only on the client-side
        const today = new Date();
        const adEpoch = new Date('0001-01-01T00:00:00Z');
        const totalMoons = countNewMoonsSince(adEpoch);
        const lunarDate = getLunarDate(today);

        if (lunarDate) {
            setLunarInfo({ totalMoons, dayOfCycle: lunarDate.lunarDay });
        }
    }, []);

    if (!lunarInfo) {
        return <div className="h-5 w-full max-w-sm animate-pulse rounded-md bg-muted" />;
    }

    return (
        <p className="text-sm font-medium text-muted-foreground">
            {`~${lunarInfo.totalMoons.toLocaleString()}th New Moon, Day ${lunarInfo.dayOfCycle}`}
        </p>
    );
}

const searchTopics = ['Nature', 'Stargazing', 'Climate', 'Food', 'Technology'];

export default function EventsCatalogue() {
  const [discoveredEvents, setDiscoveredEvents] = useState<FindEventsOutput['events']>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [currentTopic, setCurrentTopic] = useState<string | null>(null);


  // Group curated events by month
  const eventsByMonth = defaultEvents.reduce((acc, event) => {
    const month = format(parseISO(event.date), 'MMMM yyyy');
    if (!acc[month]) {
      acc[month] = [];
    }
    acc[month].push(event);
    return acc;
  }, {} as Record<string, typeof defaultEvents>);
  
  const handleSearch = async (topic: string) => {
    setIsSearching(true);
    setDiscoveredEvents([]);
    setSearchError(null);
    setCurrentTopic(topic);

    try {
        const result = await findEvents({ topic });
        if (result && result.events.length > 0) {
            setDiscoveredEvents(result.events);
        } else {
            setSearchError(`No new events found for "${topic}". Try another topic.`);
        }
    } catch (error) {
        console.error("Failed to find events:", error);
        setSearchError("An error occurred while searching for events. Please try again.");
    } finally {
        setIsSearching(false);
    }
  };

  return (
    <Card className="glass-card h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="text-accent" />
          Events Catalogue
        </CardTitle>
        <CardDescription>A list of celestial events, holidays, and AI-discovered happenings.</CardDescription>
      </CardHeader>
       <div className="px-6 pb-4 border-b">
         <h4 className="text-xs uppercase font-bold text-muted-foreground mb-1">Today's Lunar Date</h4>
         <TodayInLunar />
      </div>
      <CardContent className="flex-grow p-0">
        <ScrollArea className="h-[400px] md:h-full">
          <div className="p-6 space-y-6">
            {Object.entries(eventsByMonth).map(([month, events]) => (
              <div key={month}>
                <h3 className="font-headline text-lg font-semibold mb-3">{month}</h3>
                <ul className="space-y-4">
                  {events.map(event => (
                    <li key={event.title} className="flex flex-col sm:flex-row gap-4 items-start">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground w-full sm:w-28">
                        <Calendar className="h-4 w-4" />
                        <span>{format(parseISO(event.date), 'MMM dd')}</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{event.title}</h4>
                        <p className="text-sm text-muted-foreground">{event.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge variant={event.category === 'cosmic' ? 'secondary' : 'outline'} className="capitalize">{event.category}</Badge>
                            {event.link && (
                                <a href={event.link} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                                    Learn more
                                </a>
                            )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
      <Separator />
      <CardFooter className="p-4 flex-col items-start gap-4">
        <div>
            <h3 className="font-semibold flex items-center gap-2 mb-2"><Search className="h-4 w-4 text-accent"/>Discover More Events</h3>
            <div className="flex flex-wrap gap-2">
                {searchTopics.map(topic => (
                    <Button key={topic} variant="outline" size="sm" onClick={() => handleSearch(topic)} disabled={isSearching}>
                         {isSearching && currentTopic === topic ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        {topic}
                    </Button>
                ))}
            </div>
        </div>
        
        {isSearching && (
            <div className="w-full text-center text-muted-foreground flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Finding events for "{currentTopic}"...</span>
            </div>
        )}

        {searchError && !isSearching && (
            <Alert variant="destructive" className="w-full">
                <AlertTitle>Search Failed</AlertTitle>
                <AlertDescription>{searchError}</AlertDescription>
            </Alert>
        )}
        
        {discoveredEvents.length > 0 && !isSearching && (
             <div className="w-full space-y-4">
                <h4 className="font-semibold">Discovered Events for "{currentTopic}"</h4>
                 <ul className="space-y-4">
                  {discoveredEvents.map(event => (
                    <li key={event.title} className="flex flex-col sm:flex-row gap-4 items-start">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground w-full sm:w-28">
                        <Calendar className="h-4 w-4" />
                        <span>{format(parseISO(event.date), 'MMM dd')}</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{event.title}</h4>
                        <p className="text-sm text-muted-foreground">{event.description}</p>
                         <a href={event.link} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                            Learn more
                        </a>
                      </div>
                    </li>
                  ))}
                </ul>
             </div>
        )}
      </CardFooter>
    </Card>
  );
}
