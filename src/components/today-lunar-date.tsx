'use client';

import { useState, useEffect } from 'react';
import { getLunarDate, countNewMoonsSince } from '@/lib/moon-utils';

export default function TodayLunarDate() {
    const [lunarInfo, setLunarInfo] = useState<{ totalMoons: number; dayOfCycle: number } | null>(null);

    useEffect(() => {
        // This effect runs only on the client-side
        const today = new Date();
        const adEpoch = new Date('0001-01-01T00:00:00Z');
        const totalMoons = countNewMoonsSince(adEpoch);
        const lunarDate = getLunarDate(today);

        if (lunarDate) {
            setLunarInfo({ totalMoons, dayOfCycle: lunarDate.lunarDay });
        }
    }, []);

    if (!lunarInfo) {
        return <div className="h-5 w-full max-w-sm animate-pulse rounded-md bg-muted" />;
    }

    return (
        <p className="text-sm font-medium text-muted-foreground">
            {`~${lunarInfo.totalMoons.toLocaleString()}th New Moon, Day ${lunarInfo.dayOfCycle}`}
        </p>
    );
}
