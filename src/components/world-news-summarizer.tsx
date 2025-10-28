
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Newspaper, WandSparkles, AlertTriangle } from 'lucide-react';
import { summarizeNewsTopic, suggestNewsTopic } from '@/ai/flows/summarize-news-topic';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function WorldNewsSummarizer() {
  const [topic, setTopic] = useState('');
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSuggestTopic = async () => {
    setIsSuggesting(true);
    setError(null);
    try {
      const { suggestion } = await suggestNewsTopic();
      setTopic(suggestion);
    } catch (e) {
      console.error(e);
      setError('Could not suggest a topic. Please try again.');
    } finally {
      setIsSuggesting(false);
    }
  };
  
  const handleSummarize = async () => {
    if (!topic) return;
    setIsLoading(true);
    setError(null);
    setSummary('');

    try {
      const { summary: newSummary } = await summarizeNewsTopic({ newsTopic: topic });
      setSummary(newSummary);
    } catch (e) {
      console.error(e);
      setError('Could not fetch AI summary. This may be due to API configuration or network issues.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
     <Card className="h-full">
        <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Newspaper className="text-accent" />
            World News
        </CardTitle>
        <CardDescription>An AI-powered summary of today's top stories on any topic.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex flex-col sm:flex-row gap-2 mb-4">
                <Input
                    type="text"
                    placeholder="Enter a news topic (e.g., 'global technology trends')"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    disabled={isLoading || isSuggesting}
                    className="flex-grow"
                />
                <div className="flex gap-2">
                     <Button
                        variant="outline"
                        onClick={handleSuggestTopic}
                        disabled={isLoading || isSuggesting}
                        title="Suggest a topic"
                        className="w-full sm:w-auto"
                    >
                        <WandSparkles className="mr-2 h-4 w-4"/>
                        {isSuggesting ? 'Suggesting...' : 'Suggest'}
                    </Button>
                    <Button onClick={handleSummarize} disabled={!topic || isLoading || isSuggesting} className="w-full sm:w-auto">
                        {isLoading ? 'Summarizing...' : 'Summarize'}
                    </Button>
                </div>
            </div>

            <div className="prose prose-sm dark:prose-invert text-foreground/90 min-h-[100px] rounded-lg border border-border p-4 bg-background/30">
                {isLoading ? (
                     <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-4/5" />
                    </div>
                ) : error ? (
                    <Alert variant="destructive" className="bg-transparent border-0">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                ) : summary ? (
                    <p className="text-sm leading-relaxed font-body">{summary}</p>
                ) : (
                    <p className="text-sm text-muted-foreground">Enter a topic above and click "Summarize" to see an AI-generated news summary.</p>
                )}
            </div>
        </CardContent>
    </Card>
  );
}
