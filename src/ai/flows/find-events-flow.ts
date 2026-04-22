'use server';
/**
 * @fileOverview An AI flow for discovering events from the internet.
 *
 * - findEvents - A function that finds events based on a topic and optional location.
 * - FindEventsInput - The input type for the findEvents function.
 * - FindEventsOutput - The return type for the findEvents function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EventSchema = z.object({
    title: z.string().describe('The title of the event.'),
    date: z.string().describe('The date of the event in YYYY-MM-DD format.'),
    description: z.string().describe('A brief description of the event.'),
    link: z.string().url().describe('A valid URL to learn more about the event.'),
});

const FindEventsInputSchema = z.object({
  topic: z.string().describe('The topic to search for events about, e.g., "nature", "climate", "food".'),
  location: z.string().optional().describe('An optional location (e.g., "city, state") to narrow down the search.'),
});
export type FindEventsInput = z.infer<typeof FindEventsInputSchema>;

const FindEventsOutputSchema = z.object({
    events: z.array(EventSchema).describe('A list of discovered events.'),
});
export type FindEventsOutput = z.infer<typeof FindEventsOutputSchema>;

export async function findEvents(input: FindEventsInput): Promise<FindEventsOutput> {
  return findEventsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'findEventsPrompt',
  input: { schema: FindEventsInputSchema },
  output: { schema: FindEventsOutputSchema },
  prompt: `You are an expert event researcher. Your task is to find 5 real, upcoming, and relevant events related to the topic of {{{topic}}}{{#if location}} happening in or near {{{location}}}{{/if}}.

  The events should be interesting and accessible to a general audience. For each event, you must provide a title, a valid date in YYYY-MM-DD format, a short description, and a valid, working URL where users can learn more.

  Prioritize in-person events if a location is specified. If no events are found for the specific location, you can include online/virtual events but mention that local events were not found.

  Filter out any irrelevant results, advertisements, or events that have already passed. Ensure all links are direct and functional. Structure your response according to the output schema.`,
});

const findEventsFlow = ai.defineFlow(
  {
    name: 'findEventsFlow',
    inputSchema: FindEventsInputSchema,
    outputSchema: FindEventsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output || { events: [] };
  }
);
