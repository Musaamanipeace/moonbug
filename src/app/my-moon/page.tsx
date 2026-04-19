'use client';

import MainLayout from '@/components/main-layout';
import CurrentConditions from '@/components/current-conditions';

export default function MyMoonPage() {
    return (
        <MainLayout>
            <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
                <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tighter">
                    Current Conditions
                </h1>
                <p className="text-muted-foreground">A snapshot of your terrestrial and celestial environment.</p>
                <div className="max-w-md mx-auto">
                    <CurrentConditions />
                </div>
            </div>
        </MainLayout>
    );
}
