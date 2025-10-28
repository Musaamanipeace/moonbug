import { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import LunarCalculator from '@/components/lunar-calculator';
import RealtimeData from '@/components/realtime-data';
import NewsSummary from '@/components/news-summary';
import StickyNote from '@/components/sticky-note';
import { Skeleton } from '@/components/ui/skeleton';
import { Newspaper } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground py-4 sm:py-6 md:py-8 px-5 sm:px-10 md:px-12">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white to-accent">
            MoonPlayer
          </h1>
          <p className="text-muted-foreground mt-4 text-lg">
            Align yourself with the world around you. Discover your rhythm.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-2">
            <LunarCalculator />
          </div>

          <RealtimeData />
          
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Newspaper className="text-accent" />
                  Nature & Environment News
                </CardTitle>
                <CardDescription>An AI-powered summary of today's top stories.</CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-[80%]" />
                </div>}>
                  <NewsSummary />
                </Suspense>
              </CardContent>
            </Card>
          </div>

          <StickyNote />

        </div>
        <footer className="text-center mt-12 text-muted-foreground text-sm">
            <p>Lunar calculations are approximate and for entertainment purposes only.</p>
            <p>Built with Next.js, Genkit, and a touch of cosmic dust.</p>
        </footer>
      </div>
    </main>
  );
}
