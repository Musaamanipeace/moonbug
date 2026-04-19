import MainLayout from '@/components/main-layout';
import EventsCatalogue from '@/components/events-catalogue';

export default function EventsPage() {
  return (
    <MainLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <EventsCatalogue />
      </div>
    </MainLayout>
  );
}
