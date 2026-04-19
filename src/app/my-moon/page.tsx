'use client';

import { useState, useMemo, useEffect } from 'react';
import { useUser, useFirestore, useDoc, setDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import MainLayout from '@/components/main-layout';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { calculateLunarAge, countFullMoons, getMoonPhase, MOON_PHASES } from '@/lib/moon-utils';
import MoonPhaseIcon from '@/components/moon-phase-icon';
import { parse, isValid, isBefore, isAfter, format } from 'date-fns';
import { Loader2 } from 'lucide-react';

interface UserProfile {
    birthDate?: string;
}

export default function MyMoonPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    
    const userProfileRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, 'users', user.uid);
    }, [user, firestore]);

    const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

    const [year, setYear] = useState('');
    const [month, setMonth] = useState('');
    const [day, setDay] = useState('');
    const [parsedBirthDate, setParsedBirthDate] = useState<Date | undefined>();
    const [isSaving, setIsSaving] = useState(false);

    const birthDate = useMemo(() => {
        if (!userProfile?.birthDate) return null;
        return parse(userProfile.birthDate, 'yyyy-MM-dd', new Date());
    }, [userProfile]);

    const lunarData = useMemo(() => {
        if (!birthDate) return null;
        const age = calculateLunarAge(birthDate);
        const fullMoons = countFullMoons(birthDate);
        const birthMoonPhase = getMoonPhase(birthDate);
        return { age, fullMoons, birthMoonPhase };
    }, [birthDate]);

    // Effect for date input parsing
    useEffect(() => {
        const dateString = `${year}-${month}-${day}`;
        if (year.length === 4 && month.length >= 1 && day.length >= 1) {
            const parsed = parse(dateString, 'yyyy-MM-dd', new Date());
            if (isValid(parsed) && isBefore(parsed, new Date()) && isAfter(parsed, new Date("1900-01-01"))) {
                setParsedBirthDate(parsed);
            } else {
                setParsedBirthDate(undefined);
            }
        } else {
            setParsedBirthDate(undefined);
        }
    }, [year, month, day]);
    
    const handleSaveBirthDate = () => {
        if (!userProfileRef || !parsedBirthDate) return;
        
        setIsSaving(true);
        const dateToSave = format(parsedBirthDate, 'yyyy-MM-dd');

        // Use a non-blocking write to Firestore
        setDocumentNonBlocking(userProfileRef, { birthDate: dateToSave }, { merge: true });

        // Optimistically update, but Firestore listener will handle the real state
        setTimeout(() => setIsSaving(false), 1000);
    };

    const isLoading = isUserLoading || isProfileLoading;

    if (isLoading) {
        return (
            <MainLayout>
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-accent" />
                </div>
            </MainLayout>
        );
    }
    
    if (!user) {
        return (
             <MainLayout>
                <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
                    <Card className="glass-card">
                        <CardHeader>
                            <CardTitle>Greetings, Traveler</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Please sign in on the Profile page to discover your lunar journey.</p>
                        </CardContent>
                    </Card>
                </div>
            </MainLayout>
        )
    }

    return (
        <MainLayout>
            <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
                <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tighter">
                    My Moon
                </h1>

                {lunarData ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in-50 duration-500">
                        <Card className="glass-card md:col-span-2 lg:col-span-3">
                             <CardHeader>
                                <CardTitle>Your Cosmic Blueprint</CardTitle>
                                <CardDescription>Based on your birth date: {format(birthDate!, 'MMMM d, yyyy')}</CardDescription>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center text-center">
                                 <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-background/50">
                                    <span className="font-headline text-5xl font-bold text-accent">{lunarData.age.toFixed(2)}</span>
                                    <span className="text-muted-foreground">Lunar Cycles Old</span>
                                </div>
                                <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-background/50">
                                    <span className="font-headline text-5xl font-bold text-accent">{lunarData.fullMoons}</span>
                                    <span className="text-muted-foreground">Full Moons Witnessed</span>
                                </div>
                                <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-background/50">
                                    <MoonPhaseIcon phase={lunarData.birthMoonPhase.phaseValue} size={60} />
                                    <span className="font-headline text-2xl font-bold text-accent">{lunarData.birthMoonPhase.phaseName}</span>
                                    <span className="text-muted-foreground">Birth Moon Phase</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    <Card className="glass-card">
                         <CardHeader>
                            <CardTitle>Discover Your Lunar Journey</CardTitle>
                            <CardDescription>Enter your birth date to see your life in lunar cycles.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col sm:flex-row gap-4 items-center">
                                <div className="flex gap-2 w-full sm:w-auto">
                                    <Input type="text" placeholder="YYYY" value={year} onChange={(e) => setYear(e.target.value)} className="w-24" maxLength={4} disabled={isSaving}/>
                                    <Input type="text" placeholder="MM" value={month} onChange={(e) => setMonth(e.target.value)} className="w-16" maxLength={2} disabled={isSaving}/>
                                    <Input type="text" placeholder="DD" value={day} onChange={(e) => setDay(e.target.value)} className="w-16" maxLength={2} disabled={isSaving}/>
                                </div>
                                <Button onClick={handleSaveBirthDate} disabled={!parsedBirthDate || isSaving} className="w-full sm:w-auto">
                                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    Go
                                </Button>
                            </div>
                            {!parsedBirthDate && (year.length > 0 || month.length > 0 || day.length > 0) && (
                                <p className="text-destructive text-sm mt-2">Please enter a valid past date.</p>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </MainLayout>
    );
}
