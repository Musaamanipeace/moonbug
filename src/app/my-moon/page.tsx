
'use client';

import MainLayout from '@/components/main-layout';
import CurrentConditions from '@/components/current-conditions';
import CosmicBlueprint from '@/components/cosmic-blueprint';
import GenerationalTime from '@/components/generational-time';

export default function MyMoonPage() {
    return (
        <MainLayout>
            <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
                <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tighter">
                    My Moon
                </h1>
                <p className="text-muted-foreground">Your personal corner of the cosmos.</p>
                <div className="space-y-8 pt-4">
                    <GenerationalTime />
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                        <div>
                            <h2 className="font-headline text-2xl font-bold tracking-tight mb-4">Your Blueprint</h2>
                            <CosmicBlueprint />
                        </div>
                         <div>
                            <h2 className="font-headline text-2xl font-bold tracking-tight mb-4">Current Conditions</h2>
                            <CurrentConditions />
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
