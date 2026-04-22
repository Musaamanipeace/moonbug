'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { defaultEvents } from '@/lib/events';
import { format, parseISO } from 'date-fns';
import { Sparkles, Calendar, Search, Loader2, ArrowRight, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { findEvents, type FindEventsOutput } from '@/ai/flows/find-events-flow';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import TodayLunarDate from './today-lunar-date';
import Link from 'next/link';
import { Input } from '@/components/ui/input';

const searchTopics = ['Nature', 'Stargazing', 'Climate', 'Food', 'Technology', 'Art', 'Music'];

export default function EventsCatalogue({ showFooter = true }: { showFooter?: boolean }) {
  const [discoveredEvents, setDiscoveredEvents] = useState<FindEventsOutput['events']>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [currentSearch, setCurrentSearch] = useState<{topic: string, location?: string} | null>(null);
  const [locationInput, setLocationInput] = useState('');


  // Group curated events by month
  const eventsByMonth = defaultEvents.reduce((acc, event) => {
    const month = format(parseISO(event.date), 'MMMM yyyy');
    if (!acc[month]) {
      acc[month] = [];
    }
    acc[month].push(event);
    return acc;
  }, {} as Record<string, typeof defaultEvents>);
  
  const handleSearch = async (topic: string, location?: string) => {
    setIsSearching(true);
    setDiscoveredEvents([]);
    setSearchError(null);
    setCurrentSearch({ topic, location });

    try {
        const result = await findEvents({ topic, location: location?.trim() });
        if (result && result.events.length > 0) {
            setDiscoveredEvents(result.events);
        } else {
            let errorMsg = `No new events found for "${topic}"`;
            if (location) {
                errorMsg += ` in "${location}"`;
            }
            errorMsg += ". Try another search.";
            setSearchError(errorMsg);
        }
    } catch (error) {
        console.error("Failed to find events:", error);
        setSearchError("An error occurred while searching for events. Please try again.");
    } finally {
        setIsSearching(false);
    }
  };

  const renderSearchHeader = () => {
    if (!currentSearch) return null;
    let text = `Discovered Events for "${currentSearch.topic}"`;
    if (currentSearch.location) {
      text += ` near "${currentSearch.location}"`;
    }
    return <h4 className="font-semibold">{text}</h4>
  }

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
         <TodayLunarDate />
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
            <p className="text-sm text-muted-foreground mb-2">Search for events by topic, or add a location to find happenings near you.</p>
            <div className="flex flex-col sm:flex-row gap-2">
                <Input 
                    placeholder="City, State, or Country" 
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                    className="sm:w-48"
                />
                 <Button 
                    variant="outline" 
                    onClick={() => handleSearch(searchTopics[0], locationInput)}
                    disabled={isSearching || !locationInput}
                >
                    <MapPin className="mr-2 h-4 w-4" /> Find Local
                </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
                {searchTopics.map(topic => (
                    <Button 
                        key={topic} 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleSearch(topic, locationInput)} 
                        disabled={isSearching}
                    >
                         {isSearching && currentSearch?.topic === topic && currentSearch?.location === locationInput.trim() ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        {topic}
                    </Button>
                ))}
            </div>
        </div>
        
        {isSearching && (
            <div className="w-full text-center text-muted-foreground flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Finding events...</span>
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
                {renderSearchHeader()}
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

        {showFooter && (
            <>
                <Separator className="my-2"/>
                <Button asChild variant="ghost" className="w-full text-accent hover:text-accent">
                    <Link href="/events">
                        View All & Manage My Events
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </>
        )}
      </CardFooter>
    </Card>
  );
}
