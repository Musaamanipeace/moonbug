'use client';

import MainLayout from '@/components/main-layout';
import LunarCalendar from '@/components/lunar-calendar';

export default function CalendarPage() {
  return (
    <MainLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tighter">
          Lunar Calendar
        </h1>
        <p className="text-muted-foreground">This is your cosmic scheduler, aligned with the moons.</p>
        <LunarCalendar />
      </div>
    </MainLayout>
  );
}
