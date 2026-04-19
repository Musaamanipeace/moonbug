
'use client';

import { useState, useMemo, useCallback } from 'react';
import { getLunarYearDetails, getMoonPhase, MOON_PHASES } from '@/lib/moon-utils';
import { defaultEvents, type CalendarEvent } from '@/lib/events';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, isSameDay, parseISO } from 'date-fns';
import MoonPhaseIcon from './moon-phase-icon';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const filterCategories = [
    { id: 'holiday', name: 'Holidays', color: 'ring-green-500', text: 'text-green-500', bg: 'bg-green-500' },
    { id: 'cosmic', name: 'Cosmic', color: 'ring-purple-500', text: 'text-purple-500', bg: 'bg-purple-500' },
    { id: 'user', name: 'My Events', color: 'ring-accent', text: 'text-accent', bg: 'bg-accent' },
];

const phaseLegend = [
    { name: 'New', phaseValue: 0 },
    { name: 'Crescent', phaseValue: 0.125 },
    { name: 'Quarter', phaseValue: 0.25 },
    { name: 'Gibbous', phaseValue: 0.375 },
    { name: 'Full', phaseValue: 0.5 },
]

export default function LunarCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [userEvents, setUserEvents] = useState<Date[]>([]);
  const [activeFilters, setActiveFilters] = useState<string[]>(['holiday', 'cosmic', 'user']);

  const yearDetails = getLunarYearDetails(currentDate);
  const today = new Date();

  const handlePrevYear = () => {
    setCurrentDate(new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), 1));
  };
  
  const handleNextYear = () => {
    setCurrentDate(new Date(currentDate.getFullYear() + 1, currentDate.getMonth(), 1));
  };

  const toggleFilter = useCallback((filterId: string) => {
    setActiveFilters(prev => 
      prev.includes(filterId) 
        ? prev.filter(f => f !== filterId)
        : [...prev, filterId]
    );
  }, []);
  
  const handleDayClick = useCallback((date: Date) => {
     setUserEvents(prev => {
        const dateIndex = prev.findIndex(d => isSameDay(d, date));
        if (dateIndex > -1) {
            return [...prev.slice(0, dateIndex), ...prev.slice(dateIndex + 1)];
        } else {
            return [...prev, date];
        }
     });
  }, []);
  
  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    defaultEvents.forEach(event => {
        const dateKey = format(parseISO(event.date), 'yyyy-MM-dd');
        if (!map.has(dateKey)) {
            map.set(dateKey, []);
        }
        map.get(dateKey)!.push(event);
    });
    return map;
  }, []);

  return (
    <TooltipProvider>
      <Card className="glass-card w-full">
        <CardHeader className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handlePrevYear}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-xl font-headline text-center">
              Lunar Year {yearDetails.gregorianYear}
            </CardTitle>
            <Button variant="outline" size="icon" onClick={handleNextYear}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            {filterCategories.map(filter => (
                <Button 
                    key={filter.id}
                    variant={activeFilters.includes(filter.id) ? 'secondary' : 'outline'}
                    size="sm"
                    onClick={() => toggleFilter(filter.id)}
                    className="flex items-center gap-2"
                >
                    <Circle className={cn('h-3 w-3 fill-current', filter.text)} />
                    {filter.name}
                </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="p-2">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {yearDetails.months.map(month => {
              const days = [];
              const monthLength = Math.round((month.endDate.getTime() - month.startDate.getTime()) / (1000 * 60 * 60 * 24));
              
              for (let i = 0; i < monthLength; i++) {
                const dayDate = new Date(month.startDate);
                dayDate.setDate(dayDate.getDate() + i);

                const isToday = isSameDay(dayDate, today);
                const phaseForDay = getMoonPhase(dayDate);
                const lunarDayNumber = i + 1;
                
                const dateKey = format(dayDate, 'yyyy-MM-dd');
                const eventsOnDay = eventsByDate.get(dateKey) || [];
                const userEventOnDay = userEvents.find(d => isSameDay(d, dayDate));
                
                const highlightClasses = eventsOnDay
                    .filter(event => activeFilters.includes(event.category))
                    .map(event => filterCategories.find(f => f.id === event.category)?.color)
                    .concat(userEventOnDay && activeFilters.includes('user') ? ['ring-accent'] : [])
                    .filter(Boolean) as string[];

                days.push(
                  <Tooltip key={i} delayDuration={100}>
                    <TooltipTrigger asChild>
                      <button 
                        onClick={() => handleDayClick(dayDate)}
                        className={cn(
                          "relative flex items-center justify-center h-9 w-9 rounded-full transition-colors hover:bg-muted/50",
                          isToday && "bg-secondary",
                          highlightClasses.length > 0 && `ring-2 ring-offset-2 ring-offset-background ${highlightClasses.join(' ')}`
                        )}
                      >
                        <MoonPhaseIcon phase={phaseForDay.phaseValue} size={32} />
                        <span className="absolute text-xs font-bold text-background mix-blend-difference pointer-events-none">{lunarDayNumber}</span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="font-semibold">{format(dayDate, 'MMMM d, yyyy')}</p>
                      <p className="text-muted-foreground">{phaseForDay.phaseName}</p>
                       {eventsOnDay.map(e => <p key={e.title} className="text-sm">{e.title}</p>)}
                       {userEventOnDay && <p className="text-sm text-accent">My Event</p>}
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return (
                <div key={month.month} className="p-3 border border-border/20 rounded-lg bg-background/30">
                  <h3 className="font-bold text-center mb-2 text-primary">{month.name}</h3>
                  <div className="grid grid-cols-7 gap-1.5 place-items-center">
                    {days}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
         <CardFooter className="flex-col items-start gap-4 pt-4 border-t mt-4">
            <div>
                <h4 className="text-sm font-semibold mb-2">Phase Legend</h4>
                <div className="flex flex-wrap gap-4">
                    {phaseLegend.map(phase => (
                        <div key={phase.name} className="flex items-center gap-2 text-xs text-muted-foreground">
                            <MoonPhaseIcon phase={phase.phaseValue} size={20} />
                            <span>{phase.name}</span>
                        </div>
                    ))}
                </div>
            </div>
             <div>
                <h4 className="text-sm font-semibold mb-2">Event Legend</h4>
                <div className="flex flex-wrap gap-4">
                    {filterCategories.map(filter => (
                         <div key={filter.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                            <div className={cn('h-3 w-3 rounded-full', filter.bg)}></div>
                            <span>{filter.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </CardFooter>
      </Card>
    </TooltipProvider>
  );
}
