'use client';

import MainLayout from '@/components/main-layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link, MessageSquare, PlusCircle } from 'lucide-react';
import Image from 'next/image';

const topics = [
    'Astrophotography',
    'Gardening Tips',
    'Sustainable Living',
    'Archaeology Finds',
    'Travel & Nature',
    'DIY Projects'
];

const posts = [
    {
        topic: 'Astrophotography',
        title: 'Capturing the Andromeda Galaxy with a DSLR',
        summary: 'An incredible guide that breaks down the camera settings and stacking techniques required to get a clear shot of our galactic neighbor. It even includes tips for dealing with light pollution.',
        author: 'AstroGirl',
        link: '#',
        imageUrl: 'https://picsum.photos/seed/galaxy/400/200',
        imageHint: 'andromeda galaxy',
        comments: 12,
    },
    {
        topic: 'Gardening Tips',
        title: 'The Ultimate Guide to Companion Planting',
        summary: 'Learn which plants grow best together to naturally repel pests and improve soil health. This article completely changed how I plan my vegetable garden.',
        author: 'GreenThumb',
        link: '#',
        imageUrl: 'https://picsum.photos/seed/garden/400/200',
        imageHint: 'vegetable garden',
        comments: 28,
    },
     {
        topic: 'Sustainable Living',
        title: '10 Easy Swaps for a Zero-Waste Kitchen',
        summary: 'From beeswax wraps to reusable silicone bags, this list provides practical and affordable alternatives to single-use plastics in the kitchen. A must-read for anyone looking to reduce their footprint.',
        author: 'EcoWarrior',
        link: '#',
        imageUrl: 'https://picsum.photos/seed/kitchen/400/200',
        imageHint: 'zero-waste kitchen',
        comments: 45,
    },
];


export default function PostsPage() {
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
            <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Share a Link
            </Button>
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
                {posts.map(post => (
                    <Card key={post.title} className="glass-card overflow-hidden">
                        <div className="grid grid-cols-1 sm:grid-cols-3">
                            <div className="sm:col-span-2 p-6 flex flex-col">
                                <Badge variant="outline" className="w-fit mb-2">{post.topic}</Badge>
                                <CardTitle className="text-xl mb-2">{post.title}</CardTitle>
                                <CardDescription className="flex-grow">{post.summary}</CardDescription>
                                <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
                                    <span>by {post.author}</span>
                                    <div className="flex items-center gap-4">
                                        <a href={post.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-accent transition-colors">
                                            <Link className="h-4 w-4"/>
                                            Source
                                        </a>
                                         <div className="flex items-center gap-1">
                                            <MessageSquare className="h-4 w-4"/>
                                            {post.comments}
                                        </div>
                                    </div>
                                </div>
                            </div>
                             <div className="sm:col-span-1 relative min-h-[150px] sm:min-h-0">
                                <Image 
                                    src={post.imageUrl}
                                    alt={post.title}
                                    fill
                                    sizes="(max-width: 640px) 100vw, 33vw"
                                    className="object-cover"
                                    data-ai-hint={post.imageHint}
                                />
                            </div>
                        </div>
                    </Card>
                ))}
            </main>
        </div>
      </div>
    </MainLayout>
  );
}
