
"use client";

import { useState, useMemo, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { WandSparkles, CalendarRange, Info } from 'lucide-react';
import { calculateLunarAge, countFullMoons, calculateLunarCyclesBetween, getMoonPhase } from '@/lib/moon-utils';
import MoonPhaseIcon from './moon-phase-icon';
import { parse, isValid, isBefore, isAfter } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type View = 'lunarAge' | 'lunarPeriod';

export default function LunarCalculator() {
  const [view, setView] = useState<View>('lunarAge');

  // State for Lunar Age
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [birthDate, setBirthDate] = useState<Date | undefined>();
  const [lunarData, setLunarData] = useState<{ age: number; fullMoons: number } | null>(null);

  // State for Lunar Period
  const [startDateStr, setStartDateStr] = useState('');
  const [endDateStr, setEndDateStr] = useState('');
  const [periodLunarCycles, setPeriodLunarCycles] = useState<number | null>(null);

  // Common state
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setCurrentDate(new Date());
    setIsClient(true);
  }, []);

  const currentPhase = useMemo(() => currentDate ? getMoonPhase(currentDate) : null, [currentDate]);

  // Effect for Lunar Age date parsing
  useEffect(() => {
    if (view !== 'lunarAge') return;
    const dateString = `${year}-${month}-${day}`;
    if (year.length === 4 && month.length >= 1 && day.length >= 1) {
      const parsedDate = parse(dateString, 'yyyy-MM-dd', new Date());
      if (isValid(parsedDate) && isBefore(parsedDate, new Date()) && isAfter(parsedDate, new Date("1900-01-01"))) {
        setBirthDate(parsedDate);
      } else {
        setBirthDate(undefined);
      }
    } else {
      setBirthDate(undefined);
    }
  }, [year, month, day, view]);

  const handleCalculateAge = () => {
    if (birthDate) {
      const age = calculateLunarAge(birthDate);
      const fullMoons = countFullMoons(birthDate);
      setLunarData({ age, fullMoons });
    }
  };

  const handleCalculatePeriod = () => {
    const startDate = parse(startDateStr, 'yyyy-MM-dd', new Date());
    const endDate = parse(endDateStr, 'yyyy-MM-dd', new Date());

    if (isValid(startDate) && isValid(endDate) && isBefore(startDate, endDate)) {
      const cycles = calculateLunarCyclesBetween(startDate, endDate);
      setPeriodLunarCycles(cycles);
    } else {
      setPeriodLunarCycles(null);
    }
  };

  const isPeriodFormValid = useMemo(() => {
    const startDate = parse(startDateStr, 'yyyy-MM-dd', new Date());
    const endDate = parse(endDateStr, 'yyyy-MM-dd', new Date());
    return isValid(startDate) && isValid(endDate) && isBefore(startDate, endDate);
  }, [startDateStr, endDateStr]);


  return (
    <Card className="glass-card h-full flex flex-col">
      <CardHeader>
        <CardTitle>Your Lunar Journey</CardTitle>
        <div className="flex items-center justify-between">
            <CardDescription>
                {view === 'lunarAge' ? 'Enter your birth date to see your life in lunar cycles.' : 'Calculate lunar cycles between any two dates.'}
            </CardDescription>
            {isClient && <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={() => setView(v => v === 'lunarAge' ? 'lunarPeriod' : 'lunarAge')}>
                            <CalendarRange className="mr-2 h-4 w-4" />
                            {view === 'lunarAge' ? 'Calculate Period' : 'Calculate Age'}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Remember, all calculations are approximate!</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>}
        </div>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col justify-between">
        {view === 'lunarAge' && (
            <>
                <div className="flex flex-col sm:flex-row gap-4 items-center mb-6">
                  <div className="flex gap-2 w-full sm:w-auto">
                     <Input
                        type="text"
                        placeholder="YYYY"
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        className="w-24"
                        maxLength={4}
                      />
                      <Input
                        type="text"
                        placeholder="MM"
                        value={month}
                        onChange={(e) => setMonth(e.target.value)}
                        className="w-16"
                         maxLength={2}
                      />
                      <Input
                        type="text"
                        placeholder="DD"
                        value={day}
                        onChange={(e) => setDay(e.target.value)}
                        className="w-16"
                         maxLength={2}
                      />
                  </div>
                  <Button onClick={handleCalculateAge} disabled={!birthDate} className="w-full sm:w-auto">
                    Go
                  </Button>
                </div>
                
                {lunarData !== null ? (
                  <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 gap-6 items-center text-center animate-in fade-in-50 duration-500">
                    <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-background/50">
                        <span className="font-headline text-5xl font-bold text-accent">{lunarData.age.toFixed(2)}</span>
                        <span className="text-muted-foreground">Lunar Cycles</span>
                    </div>
                     <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-background/50">
                        <span className="font-headline text-5xl font-bold text-accent">{lunarData.fullMoons}</span>
                        <span className="text-muted-foreground">Full Moons Witnessed</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex-grow flex flex-col items-center justify-center text-center text-muted-foreground">
                     {currentPhase ? <MoonPhaseIcon phase={currentPhase.phaseValue} size={120} className="opacity-10 mb-4" /> : <div style={{width: 120, height: 120}} className="opacity-10 mb-4" /> }
                    <p>Your cosmic journey awaits calculation.</p>
                  </div>
                )}
            </>
        )}

        {view === 'lunarPeriod' && (
            <>
                <div className="flex flex-col sm:flex-row gap-4 items-center mb-6">
                    <Input
                        type="text"
                        placeholder="Start Date (YYYY-MM-DD)"
                        value={startDateStr}
                        onChange={(e) => setStartDateStr(e.target.value)}
                        className="w-full sm:w-1/2"
                    />
                    <Input
                        type="text"
                        placeholder="End Date (YYYY-MM-DD)"
                        value={endDateStr}
                        onChange={(e) => setEndDateStr(e.target.value)}
                        className="w-full sm:w-1/2"
                    />
                    <Button onClick={handleCalculatePeriod} disabled={!isPeriodFormValid} className="w-full sm:w-auto">
                        Go
                    </Button>
                </div>

                {periodLunarCycles !== null ? (
                    <div className="flex-grow flex items-center justify-center text-center animate-in fade-in-50 duration-500">
                         <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-background/50">
                            <span className="font-headline text-5xl font-bold text-accent">{periodLunarCycles.toFixed(2)}</span>
                            <span className="text-muted-foreground">Lunar Cycles in Period</span>
                        </div>
                    </div>
                ) : (
                    <div className="flex-grow flex flex-col items-center justify-center text-center text-muted-foreground">
                        {currentPhase ? <MoonPhaseIcon phase={currentPhase.phaseValue} size={120} className="opacity-10 mb-4" /> : <div style={{width: 120, height: 120}} className="opacity-10 mb-4" /> }
                        <p>Select a valid date range to begin.</p>
                    </div>
                )}
            </>
        )}
      </CardContent>
    </Card>
  );
}
