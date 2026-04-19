'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Sparkles } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function EventsCatalogue() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = () => {
    // Placeholder for search logic
    console.log('Searching for:', searchQuery);
  };

  return (
     <Card className="glass-card h-full flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
              <Sparkles className="text-accent" />
              Events Catalogue
          </CardTitle>
          <CardDescription>Discover celestial, weather, and community events.</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col">
            <div className="flex flex-col sm:flex-row gap-2 mb-4">
                <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Search events by location or keyword..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        disabled={isLoading}
                        className="pl-10 w-full"
                    />
                </div>
                <Button onClick={handleSearch} disabled={!searchQuery || isLoading}>
                    {isLoading ? 'Searching...' : 'Search'}
                </Button>
            </div>

            <div className="flex-grow prose prose-sm dark:prose-invert text-foreground/90 min-h-[100px] rounded-lg border border-border p-4 bg-background/30 flex items-center justify-center">
                {isLoading ? (
                     <div className="space-y-2">
                        {/* Placeholder for loading state */}
                    </div>
                ) : error ? (
                    <Alert variant="destructive" className="bg-transparent border-0">
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                ) : (
                    <p className="text-sm text-muted-foreground text-center">Search for celestial, weather, and community events near you.</p>
                )}
            </div>
        </CardContent>
    </Card>
  );
}
