'use client';

import { useState, useMemo, useEffect } from 'react';
import { useUser, useFirestore, useDoc, setDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { countNewMoonsSince, getLunarDate, getMoonPhase } from '@/lib/moon-utils';
import MoonPhaseIcon from '@/components/moon-phase-icon';
import { parse, isValid, format } from 'date-fns';
import { Loader2, User, Pencil, Calendar as CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

interface UserProfile {
    birthDate?: string; // YYYY-MM-DD
}

export default function CosmicBlueprint() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    
    const userProfileRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, 'users', user.uid);
    }, [user, firestore]);

    const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

    const [isEditing, setIsEditing] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>();
    const [isSaving, setIsSaving] = useState(false);
    const [now, setNow] = useState<Date | null>(null);

    useEffect(() => {
        setNow(new Date());
    }, []);

    const birthDate = useMemo(() => {
        if (!userProfile?.birthDate) return null;
        const parsed = parse(userProfile.birthDate, 'yyyy-MM-dd', new Date());
        return isValid(parsed) ? parsed : null;
    }, [userProfile]);

    const lunarData = useMemo(() => {
        if (!birthDate || !now) return null;
        const ageInMoons = countNewMoonsSince(birthDate);
        const currentLunarDate = getLunarDate(now);
        const birthMoonPhase = getMoonPhase(birthDate);
        return { 
            ageInMoons, 
            dayOfCurrentCycle: currentLunarDate?.lunarDay, 
            birthMoonPhase 
        };
    }, [birthDate, now]);

    // Effect to set initial editing state and pre-fill date picker
    useEffect(() => {
        if (!isProfileLoading && !userProfile?.birthDate) {
            setIsEditing(true);
        }
        if (birthDate) {
            setSelectedDate(birthDate);
        } else {
            setSelectedDate(undefined);
        }
    }, [isProfileLoading, userProfile, birthDate]);
    
    const handleSaveBirthDate = () => {
        if (!userProfileRef || !selectedDate) return;
        
        setIsSaving(true);
        const dateToSave = format(selectedDate, 'yyyy-MM-dd');

        setDocumentNonBlocking(userProfileRef, { birthDate: dateToSave }, { merge: true });

        setIsEditing(false);
        // Optimistically update, Firestore listener will handle the real state
        setTimeout(() => setIsSaving(false), 1000);
    };

    const isLoading = isUserLoading || isProfileLoading;

    if (isLoading || !now) {
        return (
            <Card className="glass-card flex items-center justify-center min-h-[220px]">
                <Loader2 className="h-8 w-8 animate-spin text-accent" />
            </Card>
        );
    }
    
    if (!user) {
        return (
            <Card className="glass-card">
                <CardHeader>
                    <CardTitle>Your Cosmic Blueprint</CardTitle>
                </CardHeader>
                <CardContent className="text-center text-muted-foreground">
                    <User className="mx-auto h-8 w-8 mb-2"/>
                    <p>Please sign in on the Profile page to discover your lunar journey.</p>
                </CardContent>
            </Card>
        )
    }
    
    if (lunarData && !isEditing) {
        const todaysPhase = getMoonPhase(now);
        return (
            <Card className="glass-card">
                 <CardHeader>
                    <CardTitle>Your Cosmic Blueprint</CardTitle>
                    <CardDescription>Based on your birth date: {format(birthDate!, 'MMMM d, yyyy')}</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-3 gap-2 items-center text-center">
                     <div className="flex flex-col items-center justify-center gap-1 p-2 rounded-lg bg-background/50 h-full">
                        <span className="font-headline text-3xl font-bold text-accent">{lunarData.ageInMoons.toLocaleString()}</span>
                        <span className="text-xs text-muted-foreground text-center">New Moons Lived</span>
                    </div>
                     <div className="flex flex-col items-center justify-center gap-1 p-2 rounded-lg bg-background/50 h-full relative">
                        {lunarData.dayOfCurrentCycle && (
                            <>
                                <MoonPhaseIcon phase={todaysPhase.phaseValue} size={40} />
                                <span className="absolute text-lg font-bold text-background mix-blend-difference pointer-events-none">{lunarData.dayOfCurrentCycle}</span>
                                <span className="text-xs text-muted-foreground text-center mt-auto pt-1">Day of Current Moon</span>
                            </>
                        )}
                    </div>
                    <div className="flex flex-col items-center justify-center gap-1 p-2 rounded-lg bg-background/50 h-full">
                        <MoonPhaseIcon phase={lunarData.birthMoonPhase.phaseValue} size={40} />
                        <span className="text-xs text-muted-foreground text-center mt-auto pt-1">Birth Moon Phase</span>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                        <Pencil className="mr-2 h-3 w-3" />
                        Change Date
                    </Button>
                </CardFooter>
            </Card>
        )
    }

    return (
        <Card className="glass-card">
             <CardHeader>
                <CardTitle>Discover Your Lunar Journey</CardTitle>
                <CardDescription>
                    {lunarData ? "Update your birth date." : "Enter your birth date to see your life in lunar cycles."}
                </CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="space-y-4">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full sm:w-[280px] justify-start text-left font-normal",
                                    !selectedDate && "text-muted-foreground"
                                )}
                                disabled={isSaving}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {selectedDate ? format(selectedDate, "PPP") : <span>Pick a birth date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={setSelectedDate}
                                disabled={(date) =>
                                    date > new Date() || date < new Date("1900-01-01")
                                }
                                captionLayout="dropdown-buttons"
                                fromYear={1900}
                                toYear={new Date().getFullYear()}
                            />
                        </PopoverContent>
                    </Popover>

                    <div className="flex gap-2">
                        <Button onClick={handleSaveBirthDate} disabled={!selectedDate || isSaving} className="w-full sm:w-auto">
                            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Save
                        </Button>
                        {lunarData && (
                            <Button variant="ghost" onClick={() => setIsEditing(false)} disabled={isSaving}>
                                Cancel
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}