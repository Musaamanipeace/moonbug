'use client';

import { useState, useMemo } from 'react';
import MainLayout from '@/components/main-layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Flame, Users, PlusCircle, Loader2 } from 'lucide-react';
import { useUser, useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, serverTimestamp, Timestamp } from 'firebase/firestore';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';

// Zod schema for form validation
const challengeFormSchema = z.object({
  title: z.string().min(5, { message: 'Title must be at least 5 characters.' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters.' }),
});

type Challenge = {
  id: string;
  title: string;
  description: string;
  type: 'official' | 'community';
  badge?: string;
  progress?: number;
  participants: number;
  creatorId?: string;
  creatorName?: string;
  createdAt: Timestamp;
};

export default function ChallengesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof challengeFormSchema>>({
    resolver: zodResolver(challengeFormSchema),
    defaultValues: {
      title: '',
      description: '',
    },
  });
  const { formState: { isSubmitting } } = form;

  const challengesCollectionRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'challenges');
  }, [firestore]);

  const challengesQuery = useMemoFirebase(() => {
    if (!challengesCollectionRef) return null;
    return query(challengesCollectionRef, orderBy('createdAt', 'desc'));
  }, [challengesCollectionRef]);

  const { data: challenges, isLoading: isLoadingChallenges } = useCollection<Challenge>(challengesQuery);

  const { officialChallenges, communityChallenges } = useMemo(() => {
    if (!challenges) return { officialChallenges: [], communityChallenges: [] };
    return {
      officialChallenges: challenges.filter(c => c.type === 'official'),
      communityChallenges: challenges.filter(c => c.type === 'community'),
    };
  }, [challenges]);

  async function onSubmit(values: z.infer<typeof challengeFormSchema>) {
    if (!user || !challengesCollectionRef) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: 'You must be signed in to create a challenge.',
      });
      return;
    }

    const newChallenge = {
      ...values,
      type: 'community' as const,
      creatorId: user.uid,
      creatorName: user.displayName || user.email?.split('@')[0] || 'Anonymous',
      createdAt: serverTimestamp(),
      participants: 0,
    };

    addDocumentNonBlocking(challengesCollectionRef, newChallenge);
    
    toast({
      title: 'Challenge Created!',
      description: 'Your challenge has been shared with the community.',
    });

    form.reset();
    setIsDialogOpen(false);
  }

  const isLoading = isUserLoading || isLoadingChallenges;

  return (
    <MainLayout>
      <div className="flex-1 space-y-8 p-4 md:p-8 pt-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tighter">
              Challenges
            </h1>
            <p className="text-muted-foreground mt-1">Join official Moonbug quests and community-created adventures.</p>
          </div>
          {user && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Challenge
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create a Community Challenge</DialogTitle>
                  <DialogDescription>
                    Inspire other Moonbugs with a new adventure.
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Backyard Meteor Shower Watch" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Describe the goal and rules of your challenge." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Create
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          )}
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
          </div>
        ) : (
          <>
            <section className="space-y-4">
              <h2 className="flex items-center gap-2 font-headline text-2xl font-bold tracking-tight">
                <Flame className="text-accent" />
                Moonbug Official
              </h2>
              {officialChallenges.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {officialChallenges.map((challenge) => (
                    <Card key={challenge.id} className="glass-card flex flex-col">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <CardTitle>{challenge.title}</CardTitle>
                          {challenge.badge && <Badge variant="secondary">{challenge.badge}</Badge>}
                        </div>
                        <CardDescription>{challenge.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="flex-grow space-y-4">
                        {challenge.progress != null && (
                          <div>
                            <div className="flex justify-between items-center mb-1 text-xs text-muted-foreground">
                              <span>Progress</span>
                              <span>{challenge.progress}% Complete</span>
                            </div>
                            <Progress value={challenge.progress} className="h-2" />
                          </div>
                        )}
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
              ) : (
                <Card className="glass-card">
                  <CardContent className="p-6 text-center text-muted-foreground">
                    <p>No official challenges at the moment. Check back soon!</p>
                  </CardContent>
                </Card>
              )}
            </section>
            
            <section className="space-y-4">
              <h2 className="font-headline text-2xl font-bold tracking-tight">Community Challenges</h2>
              {communityChallenges.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {communityChallenges.map((challenge) => (
                    <Card key={challenge.id} className="glass-card flex flex-col">
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
                        {challenge.creatorName && <p className="text-xs text-muted-foreground">Created by: {challenge.creatorName}</p>}
                        <Button variant="outline" className="w-full">Join Challenge</Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="glass-card">
                  <CardContent className="p-6 text-center text-muted-foreground">
                    <p>No community challenges have been created yet.</p>
                    {user && <p className="mt-2 text-sm">Why not be the first?</p>}
                  </CardContent>
                </Card>
              )}
            </section>
          </>
        )}
      </div>
    </MainLayout>
  );
}
