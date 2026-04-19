'use client';

import { useState } from 'react';
import MainLayout from '@/components/main-layout';
import { PlaceHolderImages, ImagePlaceholder } from '@/lib/placeholder-images';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ThumbsUp, Upload } from 'lucide-react';
import Image from 'next/image';

const categories = [
    "All",
    "moon",
    "sun",
    "sky",
    "plants",
    "physical features",
    "ufos"
];

function SnapCard({ snap }: { snap: ImagePlaceholder }) {
    const [votes, setVotes] = useState(Math.floor(Math.random() * 200));
    const [voted, setVoted] = useState(false);

    const handleVote = () => {
        setVotes(voted ? votes - 1 : votes + 1);
        setVoted(!voted);
    };
    
    // Extract dimensions from URL for better aspect ratio
    const urlParts = snap.imageUrl.split('/');
    const width = parseInt(urlParts[urlParts.length - 2]);
    const height = parseInt(urlParts[urlParts.length - 1]);

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
                <Button variant={voted ? "secondary" : "outline"} size="sm" onClick={handleVote} className="shrink-0">
                    <ThumbsUp className="h-4 w-4 mr-2" />
                    {votes}
                </Button>
            </CardFooter>
        </Card>
    );
}


export default function SnapsPage() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredSnaps = activeCategory === "All"
    ? PlaceHolderImages
    : PlaceHolderImages.filter(snap => snap.category === activeCategory);

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
            <Button>
                <Upload className="mr-2 h-4 w-4" />
                Upload Snap
            </Button>
        </div>
        
        <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
          <TabsList className="grid w-full grid-cols-4 sm:grid-cols-4 md:grid-cols-7">
            {categories.map((category) => (
                <TabsTrigger key={category} value={category} className="capitalize text-xs sm:text-sm">{category}</TabsTrigger>
            ))}
          </TabsList>
            
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6 animate-in fade-in-50">
            {filteredSnaps.length > 0 ? filteredSnaps.map((snap) => (
                <SnapCard key={snap.id} snap={snap} />
            )) : (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                    <p>No snaps found in this category yet.</p>
                </div>
            )}
          </div>
        </Tabs>
      </div>
    </MainLayout>
  );
}
