
"use client";

import { useState, useMemo, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { WandSparkles } from 'lucide-react';
import { calculateLunarAge, countFullMoons, getMoonPhase } from '@/lib/moon-utils';
import MoonPhaseIcon from './moon-phase-icon';
import { parse, isValid, isBefore, isAfter } from 'date-fns';

export default function LunarCalculator() {
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');

  const [birthDate, setBirthDate] = useState<Date | undefined>();
  const [lunarData, setLunarData] = useState<{ age: number; fullMoons: number } | null>(null);
  const [currentDate, setCurrentDate] = useState<Date | null>(null);

  useEffect(() => {
    // This ensures we have the current date only on the client.
    setCurrentDate(new Date());
  }, []);

  const currentPhase = useMemo(() => currentDate ? getMoonPhase(currentDate) : null, [currentDate]);

  useEffect(() => {
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
  }, [year, month, day]);


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
