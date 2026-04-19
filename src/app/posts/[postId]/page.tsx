'use client';

import { useParams } from 'next/navigation';
import MainLayout from '@/components/main-layout';
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase, addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { doc, collection, query, orderBy, serverTimestamp, Timestamp, increment } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, formatDistanceToNow } from 'date-fns';
import { Loader2, MessageSquare, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

// Type for a single post
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

// Type for a single comment
type Comment = {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  text: string;
  createdAt: Timestamp;
};

// Zod schema for the comment form
const commentSchema = z.object({
  text: z.string().min(1, 'Comment cannot be empty.').max(1000, 'Comment is too long.'),
});

export default function PostDetailPage() {
  const params = useParams();
  const postId = params.postId as string;
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  // --- Data Fetching ---
  const postRef = useMemoFirebase(() => {
    if (!firestore || !postId) return null;
    return doc(firestore, 'posts', postId);
  }, [firestore, postId]);

  const commentsCollectionRef = useMemoFirebase(() => {
    if (!postRef) return null;
    return collection(postRef, 'comments');
  }, [postRef]);

  const commentsQuery = useMemoFirebase(() => {
    if (!commentsCollectionRef) return null;
    return query(commentsCollectionRef, orderBy('createdAt', 'asc'));
  }, [commentsCollectionRef]);

  const { data: post, isLoading: isPostLoading } = useDoc<Post>(postRef);
  const { data: comments, isLoading: areCommentsLoading } = useCollection<Comment>(commentsQuery);

  // --- Comment Form ---
  const form = useForm<z.infer<typeof commentSchema>>({
    resolver: zodResolver(commentSchema),
    defaultValues: { text: '' },
  });
  const { formState: { isSubmitting } } = form;

  async function onCommentSubmit(values: z.infer<typeof commentSchema>) {
    if (!user || !commentsCollectionRef || !postRef) {
      toast({ variant: 'destructive', title: 'Error', description: 'You must be signed in to comment.' });
      return;
    }
    
    const newComment = {
      postId: postId,
      authorId: user.uid,
      authorName: user.displayName || user.email?.split('@')[0] || 'Anonymous',
      text: values.text,
      createdAt: serverTimestamp(),
    };

    // Non-blocking writes
    addDocumentNonBlocking(commentsCollectionRef, newComment);
    updateDocumentNonBlocking(postRef, { commentCount: increment(1) });

    toast({ title: 'Success!', description: 'Your comment has been posted.' });
    form.reset();
  }

  const isLoading = isUserLoading || isPostLoading;

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      </MainLayout>
    );
  }

  if (!post) {
    return (
      <MainLayout>
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold">Post not found</h2>
          <p className="text-muted-foreground">The post you are looking for does not exist.</p>
           <Button asChild variant="link" className="mt-4">
              <Link href="/posts"><ArrowLeft className="mr-2 h-4 w-4" />Back to Posts</Link>
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex-1 space-y-8 p-4 md:p-8 pt-6 max-w-4xl mx-auto">
        <div>
          <Button asChild variant="outline" size="sm" className="mb-4">
            <Link href="/posts"><ArrowLeft className="mr-2 h-4 w-4" />Back to All Posts</Link>
          </Button>
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-2xl md:text-3xl">{post.title}</CardTitle>
              <CardDescription>
                Posted by {post.authorName} on {format(post.createdAt.toDate(), 'MMMM d, yyyy')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {post.summary && <p className="mb-4">{post.summary}</p>}
              <Button asChild>
                <a href={post.url} target="_blank" rel="noopener noreferrer">View Source</a>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6" id="comments">
            <h2 className="font-headline text-2xl font-bold tracking-tight flex items-center gap-2">
                <MessageSquare />
                Comments ({comments?.length || 0})
            </h2>

            {/* Comment Submission Form */}
            {user ? (
                <Card className="glass-card">
                    <CardHeader>
                        <CardTitle className="text-lg">Leave a comment</CardTitle>
                    </CardHeader>
                    <CardContent>
                         <Form {...form}>
                            <form onSubmit={form.handleSubmit(onCommentSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="text"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Textarea placeholder="Share your thoughts..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Post Comment
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            ) : (
                <Card className="glass-card text-center">
                    <CardContent className="p-6">
                        <p className="text-muted-foreground">
                            <Link href="/profile" className="text-primary hover:underline">Sign in</Link> to join the discussion.
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Comments List */}
            {areCommentsLoading ? (
                 <div className="flex justify-center items-center h-24">
                    <Loader2 className="h-6 w-6 animate-spin text-accent" />
                </div>
            ) : comments && comments.length > 0 ? (
                <div className="space-y-4">
                    {comments.map(comment => (
                        <Card key={comment.id} className="glass-card">
                            <CardHeader className="flex flex-row items-center gap-4 space-y-0 p-4">
                                <Avatar>
                                    {/* Using a placeholder image based on user ID */}
                                    <AvatarImage src={`https://i.pravatar.cc/150?u=${comment.authorId}`} />
                                    <AvatarFallback>{comment.authorName.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <p className="font-semibold">{comment.authorName}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {formatDistanceToNow(comment.createdAt.toDate(), { addSuffix: true })}
                                    </p>
                                </div>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                                <p className="whitespace-pre-wrap">{comment.text}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card className="glass-card text-center">
                    <CardContent className="p-6 text-muted-foreground">
                       <p>No comments yet. Be the first to share your thoughts!</p>
                    </CardContent>
                </Card>
            )}
        </div>

      </div>
    </MainLayout>
  );
}
