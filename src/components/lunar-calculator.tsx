"use client";

import { useState, useMemo, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon, WandSparkles } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { calculateLunarAge, countFullMoons, getMoonPhase } from '@/lib/moon-utils';
import MoonPhaseIcon from './moon-phase-icon';

export default function LunarCalculator() {
  const [birthDate, setBirthDate] = useState<Date | undefined>();
  const [lunarData, setLunarData] = useState<{ age: number; fullMoons: number } | null>(null);
  const [currentDate, setCurrentDate] = useState<Date | null>(null);

  useEffect(() => {
    // This ensures we have the current date only on the client.
    setCurrentDate(new Date());
  }, []);

  const currentPhase = useMemo(() => currentDate ? getMoonPhase(currentDate) : null, [currentDate]);

  const handleCalculate = () => {
    if (birthDate) {
      const age = calculateLunarAge(birthDate);
      const fullMoons = countFullMoons(birthDate);
      setLunarData({ age, fullMoons });
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Your Lunar Age</CardTitle>
        <CardDescription>Enter your birth date to see your life in lunar cycles.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col justify-between">
        <div className="flex flex-col sm:flex-row gap-4 items-center mb-6">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full sm:w-[280px] justify-start text-left font-normal",
                  !birthDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {birthDate ? format(birthDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={birthDate}
                onSelect={setBirthDate}
                disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Button onClick={handleCalculate} disabled={!birthDate} className="w-full sm:w-auto">
            <WandSparkles className="mr-2 h-4 w-4" />
            Calculate
          </Button>
        </div>
        
        {lunarData !== null ? (
          <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 gap-6 items-center text-center animate-in fade-in-50 duration-500">
            <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-background/50">
                <span className="font-headline text-5xl font-bold text-accent">{lunarData.age.toFixed(2)}</span>
                <span className="text-muted-foreground">Lunar Cycles Old</span>
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
      </CardContent>
    </Card>
  );
}
