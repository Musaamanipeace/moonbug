
'use client';

import { useState, useMemo, useEffect } from 'react';
import MainLayout from '@/components/main-layout';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ThumbsUp, Upload, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useUser, useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { collection, query, where, orderBy, doc, serverTimestamp, Timestamp, increment, arrayUnion, arrayRemove } from 'firebase/firestore';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Textarea } from '@/components/ui/textarea';

const categories = [
    "All",
    "moon",
    "sun",
    "sky",
    "plants",
    "physical features",
    "ufos"
];

const snapFormSchema = z.object({
  imageUrl: z.string().url({ message: 'Please enter a valid image URL.' }),
  description: z.string().min(3, { message: 'Description must be at least 3 characters.' }),
  imageHint: z.string().min(2, { message: 'Please provide at least one hint.' }).max(30, { message: 'Hint is too long.'}),
  category: z.string({ required_error: 'Please select a category.' }),
});

type Snap = {
  id: string;
  imageUrl: string;
  description: string;
  category: string;
  imageHint: string;
  authorId: string;
  authorName: string;
  createdAt: Timestamp;
  likes: number;
  likedBy?: string[];
};

function SnapCard({ snap }: { snap: Snap }) {
    const firestore = useFirestore();
    const { user } = useUser();
    const { toast } = useToast();

    // Check if the current user has liked this snap
    const isLikedByCurrentUser = useMemo(() => {
        if (!user || !snap.likedBy) return false;
        return snap.likedBy.includes(user.uid);
    }, [user, snap.likedBy]);

    const [optimisticLiked, setOptimisticLiked] = useState(isLikedByCurrentUser);
    
    // Sync with remote state when it changes
    useEffect(() => {
        setOptimisticLiked(isLikedByCurrentUser);
    }, [isLikedByCurrentUser]);

    const handleVote = () => {
        if (!firestore) return;
        if (!user) {
            toast({
                variant: 'destructive',
                title: 'Authentication Required',
                description: 'You must be signed in to like a snap.',
            });
            return;
        }

        const snapRef = doc(firestore, 'snaps', snap.id);

        const newLikesCount = optimisticLiked ? increment(-1) : increment(1);
        const userInLikedBy = optimisticLiked ? arrayRemove(user.uid) : arrayUnion(user.uid);

        // Optimistically update the UI
        setOptimisticLiked(!optimisticLiked);
        
        // Update the database in the background
        updateDocumentNonBlocking(snapRef, {
            likes: newLikesCount,
            likedBy: userInLikedBy,
        });
    };
    
    // Extract dimensions from URL for better aspect ratio - this is a fallback
    let width = 600, height = 800;
    try {
        const urlParts = snap.imageUrl.split('/');
        const w = parseInt(urlParts[urlParts.length - 2]);
        const h = parseInt(urlParts[urlParts.length - 1]);
        if (!isNaN(w) && !isNaN(h)) {
            width = w;
            height = h;
        }
    } catch (e) {
        // Use default dimensions
    }

    // Optimistically calculate the like count for the UI
    const optimisticLikes = snap.likes + (optimisticLiked ? 1 : 0) - (isLikedByCurrentUser ? 1 : 0);

    return (
        <Card className="glass-card overflow-hidden flex flex-col">
            <CardContent className="p-0 relative" style={{ aspectRatio: `${width} / ${height}` }}>
                <Image 
                    src={snap.imageUrl} 
                    alt={snap.description} 
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                    className="object-cover"
                    data-ai-hint={snap.imageHint}
                />
            </CardContent>
            <CardFooter className="flex justify-between items-center p-3 mt-auto">
                <p className="text-xs text-muted-foreground truncate flex-1 mr-2">{snap.description}</p>
                <Button variant={optimisticLiked ? "secondary" : "outline"} size="sm" onClick={handleVote} className="shrink-0">
                    <ThumbsUp className="h-4 w-4 mr-2" />
                    {optimisticLikes}
                </Button>
            </CardFooter>
        </Card>
    );
}

export default function SnapsPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof snapFormSchema>>({
    resolver: zodResolver(snapFormSchema),
  });
  const { formState: { isSubmitting } } = form;

  const snapsCollectionRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'snaps');
  }, [firestore]);

  const snapsQuery = useMemoFirebase(() => {
    if (!snapsCollectionRef) return null;
    if (activeCategory === 'All') {
      return query(snapsCollectionRef, orderBy('createdAt', 'desc'));
    }
    return query(snapsCollectionRef, where('category', '==', activeCategory.toLowerCase()), orderBy('createdAt', 'desc'));
  }, [snapsCollectionRef, activeCategory]);

  const { data: snaps, isLoading: isLoadingSnaps } = useCollection<Snap>(snapsQuery);
  
  async function onSubmit(values: z.infer<typeof snapFormSchema>) {
    if (!user || !snapsCollectionRef) {
      toast({ variant: 'destructive', title: 'Authentication Error', description: 'You must be signed in to share a snap.' });
      return;
    }

    const newSnap = {
      ...values,
      authorId: user.uid,
      authorName: user.displayName || user.email?.split('@')[0] || 'Anonymous',
      createdAt: serverTimestamp(),
      likes: 0,
      likedBy: [],
    };

    addDocumentNonBlocking(snapsCollectionRef, newSnap);
    
    toast({ title: 'Snap Shared!', description: 'Your photo has been added to the gallery.' });
    form.reset();
    setIsDialogOpen(false);
  }

  const isLoading = isUserLoading || isLoadingSnaps;

  return (
    <MainLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
            <div className='flex-grow'>
                <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tighter">
                Snaps
                </h1>
                 <p className="text-muted-foreground mt-1">A gallery of astral and terrestrial photography from the community.</p>
            </div>
             {user && (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                    <Button>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Snap
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Share a Snap</DialogTitle>
                    <DialogDescription>Add your own photo to the Moonbug gallery.</DialogDescription>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                       <FormField
                        control={form.control}
                        name="imageUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Image URL</FormLabel>
                            <FormControl>
                              <Input placeholder="https://picsum.photos/..." {...field} />
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
                              <Textarea placeholder="A brief description of your snap." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                       <FormField
                        control={form.control}
                        name="imageHint"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Image Hints</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. full moon" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                             <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {categories.filter(c => c !== 'All').map(category => (
                                  <SelectItem key={category} value={category.toLowerCase()}>{category}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <DialogFooter>
                        <Button type="submit" disabled={isSubmitting}>
                          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Share Snap
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            )}
        </div>
        
        <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
          <TabsList className="grid w-full grid-cols-4 sm:grid-cols-4 md:grid-cols-7">
            {categories.map((category) => (
                <TabsTrigger key={category} value={category} className="capitalize text-xs sm:text-sm">{category}</TabsTrigger>
            ))}
          </TabsList>
            
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6 animate-in fade-in-50">
            {isLoading ? (
                <div className="col-span-full flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-accent" />
                </div>
            ) : snaps && snaps.length > 0 ? snaps.map((snap) => (
                <SnapCard key={snap.id} snap={snap} />
            )) : (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                    <p>No snaps found in this category yet.</p>
                     {user && activeCategory === 'All' && <p className="mt-2 text-sm">Why not be the first?</p>}
                </div>
            )}
          </div>
        </Tabs>
      </div>
    </MainLayout>
  );
}
