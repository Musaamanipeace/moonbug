
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { calculateGenerationalTime } from '@/lib/moon-utils';
import { History } from 'lucide-react';

export default function GenerationalTime() {
    const [time, setTime] = useState({ tenthGeneration: 0, generation: 0, lunarYear: 0 });

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
                <CardDescription>A symbolic count of full moons since 1 AD.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-2 text-center">
                <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-background/50">
                    <span className="font-headline text-3xl font-bold text-accent">{time.tenthGeneration}</span>
                    <span className="text-xs text-muted-foreground text-center">Tenth Generation</span>
                </div>
                <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-background/50">
                    <span className="font-headline text-3xl font-bold text-accent">{time.generation}</span>
                    <span className="text-xs text-muted-foreground text-center">Generation</span>
                </div>
                <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-background/50">
                    <span className="font-headline text-3xl font-bold text-accent">{time.lunarYear}</span>
                    <span className="text-xs text-muted-foreground text-center">Lunar Year</span>
                </div>
            </CardContent>
        </Card>
    );
}
