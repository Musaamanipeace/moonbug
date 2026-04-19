'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { defaultEvents } from '@/lib/events';
import { format, parseISO } from 'date-fns';
import { Sparkles, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function EventsCatalogue() {
  // Group events by month
  const eventsByMonth = defaultEvents.reduce((acc, event) => {
    const month = format(parseISO(event.date), 'MMMM yyyy');
    if (!acc[month]) {
      acc[month] = [];
    }
    acc[month].push(event);
    return acc;
  }, {} as Record<string, typeof defaultEvents>);

  return (
    <Card className="glass-card h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="text-accent" />
          Events Catalogue
        </CardTitle>
        <CardDescription>A curated list of celestial events and holidays.</CardDescription>
      </CardHeader>
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
    </Card>
  );
}
