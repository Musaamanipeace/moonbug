'use client';

import { useState } from 'react';
import MainLayout from '@/components/main-layout';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';

export default function CalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <MainLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tighter">
          Calendar
        </h1>
        <p className="text-muted-foreground">This is your cosmic scheduler. Mark personal deadlines and track celestial events.</p>
        <Card className="glass-card">
            <CardContent className="p-4 flex justify-center">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md"
                />
            </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
