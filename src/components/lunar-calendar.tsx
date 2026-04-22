'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { getLunarYearDetails, getMoonPhase } from '@/lib/moon-utils';
import { defaultEvents, type CalendarEvent } from '@/lib/events';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Circle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, isSameDay, parseISO } from 'date-fns';
import MoonPhaseIcon from './moon-phase-icon';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { useUser, useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking } from '@/firebase';
import { collection, serverTimestamp, Timestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

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
];

type UserEvent = {
  id: string;
  title: string;
  location?: string;
  date: string; // YYYY-MM-DD
  createdAt: Timestamp;
};

const calendarEventSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
});

export default function LunarCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeFilters, setActiveFilters] = useState<string[]>(['holiday', 'cosmic', 'user']);
  const [api, setApi] = useState<CarouselApi>()
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof calendarEventSchema>>({
    resolver: zodResolver(calendarEventSchema),
    defaultValues: { title: '' },
  });

  const eventsCollectionRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, 'users', user.uid, 'events');
  }, [user, firestore]);

  const { data: userEventsFromDb, isLoading: isLoadingEvents } = useCollection<UserEvent>(eventsCollectionRef);

  const userEvents = useMemo(() => {
    if (!userEventsFromDb) return [];
    return userEventsFromDb.map(event => ({ ...event, parsedDate: parseISO(event.date) }));
  }, [userEventsFromDb]);

  const yearDetails = getLunarYearDetails(currentDate);
  const today = useMemo(() => new Date(), []);
  
  const currentMonthIndex = useMemo(() => {
    return yearDetails.months.findIndex(month => today >= month.startDate && today < month.endDate);
  }, [yearDetails.months, today]);

  useEffect(() => {
    if (!api) return;
    if (currentMonthIndex !== -1) {
      api.scrollTo(currentMonthIndex, true);
    }
  }, [api, currentMonthIndex]);

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
    if (!user) {
        toast({
            variant: 'destructive',
            title: 'Not signed in',
            description: 'Please sign in to save your custom events.',
        });
        return;
     }
    
    setSelectedDate(date);
    setIsEventDialogOpen(true);
  }, [user, toast]);

  const onEventSubmit = (values: z.infer<typeof calendarEventSchema>) => {
    if (!user || !eventsCollectionRef || !selectedDate) return;
    const newEvent = {
        title: values.title,
        date: format(selectedDate, 'yyyy-MM-dd'),
        authorId: user.uid,
        createdAt: serverTimestamp(),
    };
    addDocumentNonBlocking(eventsCollectionRef, newEvent);
    toast({ title: 'Event Added!', description: `"${values.title}" has been saved.` });
    form.reset();
    setIsEventDialogOpen(false);
  }
  
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
            <Carousel setApi={setApi} opts={{ align: "start" }} className="w-full">
                <CarouselContent>
                    {(isUserLoading || isLoadingEvents) && !userEvents ? (
                        <div className="flex items-center justify-center w-full h-64 col-span-full">
                            <Loader2 className="animate-spin text-accent h-8 w-8" />
                        </div>
                    ) : yearDetails.months.map(month => {
                    const days = [];
                    const monthLength = Math.round((month.endDate.getTime() - month.startDate.getTime()) / (1000 * 60 * 60 * 24));
                    const isCurrentMonth = today >= month.startDate && today < month.endDate;
                    
                    for (let i = 0; i < monthLength; i++) {
                        const dayDate = new Date(month.startDate);
                        dayDate.setDate(dayDate.getDate() + i);

                        const isToday = isSameDay(dayDate, today);
                        const phaseForDay = getMoonPhase(dayDate);
                        const lunarDayNumber = i + 1;
                        
                        const dateKey = format(dayDate, 'yyyy-MM-dd');
                        const publicEventsOnDay = eventsByDate.get(dateKey) || [];
                        const userEventsOnDay = userEvents.filter(d => isSameDay(d.parsedDate, dayDate));
                        
                        const highlightClasses = publicEventsOnDay
                            .filter(event => activeFilters.includes(event.category))
                            .map(event => filterCategories.find(f => f.id === event.category)?.color)
                            .concat(userEventsOnDay.length > 0 && activeFilters.includes('user') ? ['ring-accent'] : [])
                            .filter(Boolean) as string[];

                        days.push(
                        <Tooltip key={i} delayDuration={100}>
                            <TooltipTrigger asChild>
                            <button 
                                onClick={() => handleDayClick(dayDate)}
                                className={cn(
                                "relative flex items-center justify-center h-9 w-9 rounded-full transition-colors hover:bg-muted/50",
                                isToday && "bg-accent text-accent-foreground",
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
                            {publicEventsOnDay.map(e => <p key={e.title} className="text-sm">{e.title}</p>)}
                            {userEventsOnDay.map(e => <p key={e.id} className="text-sm text-accent">{e.title}</p>)}
                            </TooltipContent>
                        </Tooltip>
                        );
                    }

                    return (
                        <CarouselItem key={month.month} className="md:basis-1/2 lg:basis-1/3">
                            <div className="p-3 border border-border/20 rounded-lg bg-background/30 h-full">
                                <h3 className={cn("font-bold text-center mb-2", isCurrentMonth ? "text-accent" : "text-primary")}>{month.name}</h3>
                                <div className="grid grid-cols-7 gap-1.5 place-items-center">
                                    {days}
                                </div>
                            </div>
                        </CarouselItem>
                    );
                    })}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
            </Carousel>
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
      <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Add Event for {selectedDate && format(selectedDate, 'MMMM d, yyyy')}</DialogTitle>
                <DialogDescription>Create a new personal event on this day.</DialogDescription>
            </DialogHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onEventSubmit)} className="space-y-4">
                    <FormField control={form.control} name="title" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Event Title</FormLabel>
                            <FormControl><Input placeholder="e.g., Stargazing party" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <DialogFooter>
                        <Button type="submit" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting && <Loader2 className="animate-spin" />}
                            Save Event
                        </Button>
                    </DialogFooter>
                </form>
            </Form>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
