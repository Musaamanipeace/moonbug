"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getSeason, getMoonPhase } from '@/lib/moon-utils';
import { Sun, Cloud, CloudRain, Snowflake, MoonStar, Clock, Zap, Leaf } from 'lucide-react';
import MoonPhaseIcon from './moon-phase-icon';

const weatherOptions = [
  { name: 'Sunny', icon: <Sun className="text-yellow-400" />, temp: '25°C' },
  { name: 'Cloudy', icon: <Cloud className="text-gray-400" />, temp: '18°C' },
  { name: 'Rainy', icon: <CloudRain className="text-blue-400" />, temp: '15°C' },
  { name: 'Snowy', icon: <Snowflake className="text-white" />, temp: '-2°C' },
];

export default function RealtimeData() {
  const [now, setNow] = useState(new Date());
  const [weather, setWeather] = useState(weatherOptions[0]);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    // On mount, pick a random weather for demonstration
    setWeather(weatherOptions[Math.floor(Math.random() * weatherOptions.length)]);
    return () => clearInterval(timer);
  }, []);

  const moonPhase = getMoonPhase(now);
  const season = getSeason(now);
  const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  const date = now.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Conditions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className='text-center border-b pb-4'>
            <p className="font-mono font-bold text-4xl text-accent">{time}</p>
            <p className="text-sm text-muted-foreground">{date}</p>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Leaf className="w-5 h-5 text-accent" />
            <div>
              <p className="font-semibold text-lg">{season}</p>
              <p className="text-xs text-muted-foreground">Season</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <div>
              <p className="font-semibold text-lg">{weather.name}</p>
              <p className="text-xs text-muted-foreground">Mock Weather</p>
            </div>
            <div className="flex items-center gap-2">
                {weather.icon}
                <span className="font-mono font-bold text-sm">{weather.temp}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <MoonStar className="w-5 h-5 text-accent"/>
                <div>
                    <p className="font-semibold text-lg">{moonPhase.phaseName}</p>
                    <p className="text-xs text-muted-foreground">Lunar Phase</p>
                </div>
            </div>
            <MoonPhaseIcon phase={moonPhase.phaseValue} size={40} />
        </div>

      </CardContent>
    </Card>
  );
}
