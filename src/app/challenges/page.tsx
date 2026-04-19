'use client';

import MainLayout from '@/components/main-layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Flame, Users } from 'lucide-react';

const officialChallenges = [
  {
    title: 'The Meteor Marathon',
    description: 'Capture a photo of the upcoming Perseid meteor shower. The best shot wins a feature on the main dashboard!',
    badge: 'Official',
    progress: 75,
    participants: 1234
  },
  {
    title: 'Lunar Cycle Growth',
    description: 'Track a plant\'s growth over one full lunar cycle. Upload a photo every quarter phase.',
    badge: 'Long-Term',
    progress: 25,
    participants: 876
  },
];

const communityChallenges = [
  {
    title: 'Golden Hour Yoga',
    description: 'Share a photo or a short clip of you doing yoga during the magical golden hour.',
    creator: 'AstroYogi',
    participants: 45
  },
  {
    title: 'City Stargazing',
    description: 'Find a spot in your city with the least light pollution and snap a picture of a constellation.',
    creator: 'UrbanAstronomer',
    participants: 112
  },
];


export default function ChallengesPage() {
  return (
    <MainLayout>
      <div className="flex-1 space-y-8 p-4 md:p-8 pt-6">
        <div>
            <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tighter">
            Challenges
            </h1>
            <p className="text-muted-foreground mt-1">Join official Moonbug quests and community-created adventures.</p>
        </div>

        <section className="space-y-4">
            <h2 className="flex items-center gap-2 font-headline text-2xl font-bold tracking-tight">
                <Flame className="text-accent" />
                Moonbug Official
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {officialChallenges.map((challenge) => (
                    <Card key={challenge.title} className="glass-card flex flex-col">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <CardTitle>{challenge.title}</CardTitle>
                                <Badge variant="secondary">{challenge.badge}</Badge>
                            </div>
                            <CardDescription>{challenge.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow space-y-4">
                             <div>
                                <div className="flex justify-between items-center mb-1 text-xs text-muted-foreground">
                                    <span>Progress</span>
                                    <span>{challenge.progress}% Complete</span>
                                </div>
                                <Progress value={challenge.progress} className="h-2" />
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                                <Users className="h-4 w-4 mr-2" />
                                {challenge.participants.toLocaleString()} Moonbugs participating
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full">View Challenge</Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </section>
        
        <section className="space-y-4">
            <h2 className="font-headline text-2xl font-bold tracking-tight">Community Challenges</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {communityChallenges.map((challenge) => (
                    <Card key={challenge.title} className="glass-card flex flex-col">
                        <CardHeader>
                            <CardTitle>{challenge.title}</CardTitle>
                            <CardDescription>{challenge.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow">
                             <div className="flex items-center text-sm text-muted-foreground">
                                <Users className="h-4 w-4 mr-2" />
                                {challenge.participants.toLocaleString()} Moonbugs participating
                            </div>
                        </CardContent>
                        <CardFooter className="flex-col items-start gap-2">
                             <p className="text-xs text-muted-foreground">Created by: {challenge.creator}</p>
                            <Button variant="outline" className="w-full">Join Challenge</Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </section>

      </div>
    </MainLayout>
  );
}
