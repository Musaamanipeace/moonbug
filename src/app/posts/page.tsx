'use client';

import { useState, useMemo } from 'react';
import MainLayout from '@/components/main-layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link, MessageSquare, PlusCircle, Loader2 } from 'lucide-react';
import Image from 'next/image';
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
import { useUser, useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, serverTimestamp, Timestamp } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

const topics = [
  'Astrophotography',
  'Gardening Tips',
  'Sustainable Living',
  'Archaeology Finds',
  'Travel & Nature',
  'DIY Projects'
];

// Zod schema for form validation
const postFormSchema = z.object({
  title: z.string().min(5, { message: 'Title must be at least 5 characters.' }),
  url: z.string().url({ message: 'Please enter a valid URL.' }),
  summary: z.string().optional(),
  topic: z.string({ required_error: 'Please select a topic.' }),
});

type Post = {
  id: string;
  title: string;
  url: string;
  summary?: string;
  topic: string;
  authorId: string;
  authorName: string;
  createdAt: Timestamp;
  commentCount: number;
};

export default function PostsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof postFormSchema>>({
    resolver: zodResolver(postFormSchema),
    defaultValues: {
      title: '',
      url: '',
      summary: '',
    },
  });
  const { formState: { isSubmitting } } = form;

  const postsCollectionRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'posts');
  }, [firestore]);

  const postsQuery = useMemoFirebase(() => {
    if (!postsCollectionRef) return null;
    return query(postsCollectionRef, orderBy('createdAt', 'desc'));
  }, [postsCollectionRef]);

  const { data: posts, isLoading: isLoadingPosts } = useCollection<Post>(postsQuery);

  async function onSubmit(values: z.infer<typeof postFormSchema>) {
    if (!user || !postsCollectionRef) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: 'You must be signed in to share a post.',
      });
      return;
    }

    const newPost = {
      ...values,
      authorId: user.uid,
      authorName: user.displayName || user.email?.split('@')[0] || 'Anonymous',
      createdAt: serverTimestamp(),
      commentCount: 0,
    };

    // Use non-blocking add
    addDocumentNonBlocking(postsCollectionRef, newPost);
    
    toast({
      title: 'Post Shared!',
      description: 'Your link has been successfully shared with the community.',
    });

    form.reset();
    setIsDialogOpen(false);
  }

  const PostCard = ({ post }: { post: Post }) => (
    <Card key={post.id} className="glass-card overflow-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-3">
            <div className="sm:col-span-2 p-6 flex flex-col">
                <Badge variant="outline" className="w-fit mb-2">{post.topic}</Badge>
                <CardTitle className="text-xl mb-2">{post.title}</CardTitle>
                {post.summary && <CardDescription className="flex-grow">{post.summary}</CardDescription>}
                <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
                    <span>by {post.authorName} &middot; {post.createdAt ? formatDistanceToNow(post.createdAt.toDate(), { addSuffix: true }) : '...'}</span>
                    <div className="flex items-center gap-4">
                        <a href={post.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-accent transition-colors">
                            <Link className="h-4 w-4"/>
                            Source
                        </a>
                         <div className="flex items-center gap-1">
                            <MessageSquare className="h-4 w-4"/>
                            {post.commentCount}
                        </div>
                    </div>
                </div>
            </div>
             <div className="sm:col-span-1 relative min-h-[150px] sm:min-h-0">
                <Image 
                    src={`https://picsum.photos/seed/${post.id}/400/200`}
                    alt={post.title}
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="object-cover"
                    data-ai-hint={post.topic}
                />
            </div>
        </div>
    </Card>
  );

  return (
    <MainLayout>
      <div className="flex-1 space-y-8 p-4 md:p-8 pt-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
                <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tighter">
                Posts
                </h1>
                <p className="text-muted-foreground mt-1">Share and discover links, articles, and videos from the community.</p>
            </div>
            {user && (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Share a Link
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Share a Link</DialogTitle>
                    <DialogDescription>
                      Found something cool? Share it with the Moonbug community.
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
                              <Input placeholder="e.g., Guide to Stargazing" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="url"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>URL</FormLabel>
                            <FormControl>
                              <Input placeholder="https://example.com/article" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="summary"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Summary (Optional)</FormLabel>
                            <FormControl>
                              <Textarea placeholder="A brief description of the link's content." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="topic"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Topic</FormLabel>
                             <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a topic" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {topics.map(topic => (
                                  <SelectItem key={topic} value={topic}>{topic}</SelectItem>
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
                          Share Post
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <aside className="md:col-span-1">
                <Card className="glass-card sticky top-4">
                    <CardHeader>
                        <CardTitle>Topics</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                           {topics.map(topic => (
                               <li key={topic}>
                                   <Button variant="ghost" className="w-full justify-start">{topic}</Button>
                               </li>
                           ))}
                        </ul>
                    </CardContent>
                </Card>
            </aside>
            <main className="md:col-span-3 space-y-6">
                {isUserLoading || isLoadingPosts ? (
                  <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-accent" />
                  </div>
                ) : posts && posts.length > 0 ? (
                    posts.map(post => <PostCard key={post.id} post={post} />)
                ) : (
                    <Card className="glass-card">
                        <CardContent className="p-6 text-center text-muted-foreground">
                            <p>No posts have been shared yet.</p>
                            {user && <p className="mt-2 text-sm">Why not be the first?</p>}
                        </CardContent>
                    </Card>
                )}
            </main>
        </div>
      </div>
    </MainLayout>
  );
}
