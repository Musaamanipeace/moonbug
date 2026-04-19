'use client';

import { useState } from 'react';
import { getLunarYearDetails, getLunarDate } from '@/lib/moon-utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function LunarCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const yearDetails = getLunarYearDetails(currentDate);
  const today = new Date();
  const todayLunar = getLunarDate(today);

  const handlePrevYear = () => {
    setCurrentDate(new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), 1));
  };
  
  const handleNextYear = () => {
    setCurrentDate(new Date(currentDate.getFullYear() + 1, currentDate.getMonth(), 1));
  };
  
  return (
    <Card className="glass-card w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <Button variant="outline" size="icon" onClick={handlePrevYear}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <CardTitle className="text-xl font-headline">
          Lunar Year {yearDetails.gregorianYear}
        </CardTitle>
        <Button variant="outline" size="icon" onClick={handleNextYear}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-2">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {yearDetails.months.map(month => {
            const days = [];
            const monthLength = Math.round((month.endDate.getTime() - month.startDate.getTime()) / (1000 * 60 * 60 * 24));
            
            for (let i = 1; i <= monthLength; i++) {
              const isToday = todayLunar && !todayLunar.isIntercalary && todayLunar.lunarMonth === month.month && todayLunar.lunarDay === i;
              days.push(
                <div 
                  key={i} 
                  className={cn(
                    "flex items-center justify-center h-8 w-8 rounded-full text-sm",
                    isToday ? "bg-accent text-accent-foreground font-bold" : ""
                  )}
                >
                  {i}
                </div>
              );
            }

            return (
              <div key={month.month} className="p-3 border border-border/20 rounded-lg bg-background/30">
                <h3 className="font-bold text-center mb-2 text-primary">{month.name}</h3>
                <p className="text-xs text-muted-foreground text-center mb-2">
                  {format(month.startDate, 'MMM d')} - {format(new Date(month.endDate.getTime() - 86400000), 'MMM d')}
                </p>
                <div className="grid grid-cols-7 gap-1">
                  {days}
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 text-center text-muted-foreground text-sm">
            <p>The days between the end of the 12th moon and the first new moon of the next Gregorian year are considered intercalary or "waiting" days.</p>
            {todayLunar && <p>Today is: {todayLunar.isIntercalary ? `an Intercalary Day` : `Day ${todayLunar.lunarDay} of the ${todayLunar.monthName}`}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
