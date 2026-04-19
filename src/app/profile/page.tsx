import MainLayout from '@/components/main-layout';

export default function ProfilePage() {
  return (
    <MainLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tighter">
          Profile
        </h1>
        <p className="text-muted-foreground">User profiles and login functionality will be implemented here.</p>
      </div>
    </MainLayout>
  );
}
