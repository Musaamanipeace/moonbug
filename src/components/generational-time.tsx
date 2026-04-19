'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { calculateGenerationalTime } from '@/lib/moon-utils';
import { History, Moon } from 'lucide-react';
import MoonPhaseIcon from './moon-phase-icon';

export default function GenerationalTime() {
    const [time, setTime] = useState<{ totalMoons: number; dayOfCycle: number; phaseName: string; phaseValue: number; } | null>(null);

    useEffect(() => {
        // This effect runs only on the client-side after mount
        setTime(calculateGenerationalTime(new Date()));
    }, []);

    return (
        <Card className="glass-card">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <History className="text-accent"/>
                    Generational Time
                </CardTitle>
                <CardDescription>A symbolic count of new moons since 1 AD.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-2 text-center">
                <div className="flex flex-col items-center justify-center gap-1 p-2 rounded-lg bg-background/50 h-full">
                    <span className="font-headline text-3xl font-bold text-accent">{time ? time.totalMoons.toLocaleString() : '...'}</span>
                    <span className="text-xs text-muted-foreground text-center">Total Moons</span>
                </div>
                 <div className="flex flex-col items-center justify-center gap-1 p-2 rounded-lg bg-background/50 h-full relative">
                    {time ? (
                        <>
                            <MoonPhaseIcon phase={time.phaseValue} size={40} />
                             <span className="absolute text-lg font-bold text-background mix-blend-difference pointer-events-none">{time.dayOfCycle}</span>
                            <span className="text-xs text-muted-foreground text-center mt-auto pt-1">Day of Moon</span>
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full"><Moon className="w-8 h-8 text-muted-foreground" /></div>
                    )}
                </div>
                <div className="flex flex-col items-center justify-center gap-1 p-2 rounded-lg bg-background/50 h-full">
                     <span className="font-headline text-lg font-bold text-accent h-10 flex items-center justify-center">{time ? time.phaseName : '...'}</span>
                    <span className="text-xs text-muted-foreground text-center">Current Phase</span>
                </div>
            </CardContent>
        </Card>
    );
}
