
import CosmicBlueprint from '@/components/cosmic-blueprint';
import EventsCatalogue from '@/components/events-catalogue';
import StickyNote from '@/components/sticky-note';
import MainLayout from '@/components/main-layout';
import AtmosphericMusicPlayer from '@/components/atmospheric-music-player';

export default function Home() {
  return (
    <MainLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tighter">
            Dashboard
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-2">
            <EventsCatalogue />
          </div>

          <div className="lg:col-span-1">
            <div className="grid gap-6">
              <CosmicBlueprint />
              <StickyNote />
              <AtmosphericMusicPlayer />
            </div>
          </div>

        </div>
        <footer className="text-center pt-12 text-muted-foreground text-sm">
            <p>Lunar calculations are approximate and for entertainment purposes only.</p>
            <p>Built with Next.js, Genkit, and a touch of cosmic dust.</p>
        </footer>
      </div>
    </MainLayout>
  );
}
