import { summarizeEnvironmentalNews } from '@/ai/flows/summarize-environmental-news';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle } from 'lucide-react';

export default async function NewsSummary() {
  try {
    const { summary } = await summarizeEnvironmentalNews({ newsTopic: 'global environmental and nature news' });
    return <p className="text-sm text-foreground/90 leading-relaxed font-body">{summary}</p>;
  } catch (error) {
    console.error('Failed to generate news summary:', error);
    return (
        <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
                Could not fetch AI summary. This may be due to API configuration or network issues.
            </AlertDescription>
        </Alert>
    );
  }
}
