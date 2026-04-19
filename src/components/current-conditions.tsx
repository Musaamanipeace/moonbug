
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getSeason, getMoonPhase, getMoonPosition, getPhaseTransitionTimes } from '@/lib/moon-utils';
import { Sun, Cloud, CloudRain, Snowflake, MoonStar, Leaf, Eye, Hourglass } from 'lucide-react';
import MoonPhaseIcon from './moon-phase-icon';
import type { getMoonPhase as GetMoonPhaseType, getPhaseTransitionTimes as GetPhaseTransitionTimesType } from '@/lib/moon-utils';
import { Separator } from './ui/separator';

const weatherOptions = [
  { name: 'Sunny', icon: <Sun className="text-yellow-400" />, temp: '25°C' },
  { name: 'Cloudy', icon: <Cloud className="text-gray-400" />, temp: '18°C' },
  { name: 'Rainy', icon: <CloudRain className="text-blue-400" />, temp: '15°C' },
  { name: 'Snowy', icon: <Snowflake className="text-white" />, temp: '-2°C' },
];

type WeatherOption = typeof weatherOptions[0];
type MoonPhase = ReturnType<typeof GetMoonPhaseType>;
type PhaseTransition = ReturnType<typeof GetPhaseTransitionTimesType>;

export default function CurrentConditions() {
  const [now, setNow] = useState<Date | null>(null);
  const [weather, setWeather] = useState<WeatherOption | null>(null);

  useEffect(() => {
    // Ensure this runs only on the client
    setNow(new Date());
    setWeather(weatherOptions[Math.floor(Math.random() * weatherOptions.length)]);
    const timer = setInterval(() => setNow(new Date()), 1000 * 60); // Update every minute
    return () => clearInterval(timer);
  }, []);

  const moonPhase: MoonPhase | null = now ? getMoonPhase(now) : null;
  const season: string | null = now ? getSeason(now) : null;
  const time: string | null = now ? now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : null;
  const date: string | null = now ? now.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : null;
  const moonPosition: string | null = now && moonPhase ? getMoonPosition(now, moonPhase.phaseValue) : null;
  const transitionTimes: PhaseTransition | null = now ? getPhaseTransitionTimes(now) : null;


  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle>Current Conditions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className='text-center border-b pb-4 min-h-[76px]'>
            {time && <p className="font-mono font-bold text-4xl text-accent">{time}</p>}
            {date && <p className="text-sm text-muted-foreground">{date}</p>}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Leaf className="w-5 h-5 text-accent" />
            <div>
              <p className="font-semibold text-lg">{season || '...'}</p>
              <p className="text-xs text-muted-foreground">Season</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <div>
              <p className="font-semibold text-lg">{weather?.name || '...'}</p>
              <p className="text-xs text-muted-foreground">Mock Weather</p>
            </div>
            <div className="flex items-center gap-2">
                {weather?.icon}
                <span className="font-mono font-bold text-sm">{weather?.temp}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <MoonStar className="w-5 h-5 text-accent"/>
                <div>
                    <p className="font-semibold text-lg">{moonPhase?.phaseName || '...'}</p>
                    <p className="text-xs text-muted-foreground">Lunar Phase</p>
                </div>
            </div>
            {moonPhase ? <MoonPhaseIcon phase={moonPhase.phaseValue} size={40} /> : <div style={{width: 40, height: 40}}/>}
        </div>

        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-accent"/>
                <div>
                    <p className="font-semibold text-lg">{moonPosition || '...'}</p>
                    <p className="text-xs text-muted-foreground">Moon Visibility</p>
                </div>
            </div>
        </div>
        
        <Separator />
        
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <Hourglass className="w-5 h-5 text-accent"/>
                <div>
                    {transitionTimes ? (
                        <>
                            <p className="font-semibold text-lg">Started {transitionTimes.elapsedHours.toFixed(0)} hours ago</p>
                            <p className="text-xs text-muted-foreground">Transitioning in {transitionTimes.remainingHours.toFixed(0)} hours</p>
                        </>
                    ) : (
                        <p className="font-semibold text-lg">...</p>
                    )}
                </div>
            </div>
        </div>

      </CardContent>
    </Card>
  );
}
