
import MainLayout from '@/components/main-layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { historicalEvents, type HistoricalEvent } from '@/lib/historical-events';
import { getLunarDate, countNewMoonsSince } from '@/lib/moon-utils';
import { format, parseISO, isValid } from 'date-fns';
import { ScrollText } from 'lucide-react';

function HistoricalEventCard({ event }: { event: HistoricalEvent }) {
    const gregorianDate = parseISO(event.gregorianDate);
    const isDateValid = isValid(gregorianDate);

    const formattedGregorianDate = isDateValid
        ? format(gregorianDate, 'MMMM d, yyyy')
        : event.gregorianDate;

    let formattedLunarDate: string;

    if (isDateValid) {
        const adEpoch = new Date('0001-01-01T00:00:00Z');
        const totalMoons = countNewMoonsSince(adEpoch, gregorianDate);
        const lunarDateInfo = getLunarDate(gregorianDate);
        
        if (lunarDateInfo) {
            formattedLunarDate = `~${totalMoons.toLocaleString()}th New Moon, Day ${lunarDateInfo.lunarDay}`;
        } else {
            formattedLunarDate = 'Not Applicable';
        }
    } else {
        formattedLunarDate = 'Not Applicable';
    }

    return (
        <Card className="glass-card">
            <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                    <CardTitle className="text-xl">{event.title}</CardTitle>
                    <Badge variant="outline">{event.category}</Badge>
                </div>
                <CardDescription>{event.description}</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="p-3 rounded-lg bg-background/50">
                    <h4 className="font-semibold text-muted-foreground">Gregorian Date</h4>
                    <p className="font-mono text-foreground">{formattedGregorianDate}</p>
                </div>
                <div className="p-3 rounded-lg bg-background/50">
                    <h4 className="font-semibold text-muted-foreground">Lunar Date</h4>
                    <p className="font-mono text-foreground">{formattedLunarDate}</p>
                </div>
            </CardContent>
        </Card>
    );
}

export default function HistoryPage() {
  // Sort events from most recent to oldest, handling invalid dates
  const sortedEvents = historicalEvents.sort((a, b) => {
    const dateA = parseISO(a.gregorianDate);
    const dateB = parseISO(b.gregorianDate);

    // Treat invalid dates as infinitely old so they appear at the end of the descending list
    const timeA = isValid(dateA) ? dateA.getTime() : -Infinity;
    const timeB = isValid(dateB) ? dateB.getTime() : -Infinity;

    return timeB - timeA;
  });

  return (
    <MainLayout>
      <div className="flex-1 space-y-8 p-4 md:p-8 pt-6">
        <div>
            <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tighter flex items-center gap-3">
                <ScrollText className="w-8 h-8"/>
                History
            </h1>
            <p className="text-muted-foreground mt-1">Significant moments in time, viewed through a lunar lens.</p>
        </div>

        <div className="space-y-6">
            {sortedEvents.map(event => (
                <HistoricalEventCard key={event.title} event={event} />
            ))}
        </div>
      </div>
    </MainLayout>
  );
}
