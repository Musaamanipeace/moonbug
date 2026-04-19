
'use server';

/**
 * @fileOverview An AI agent that summarizes events.
 *
 * - summarizeEvent - A function that summarizes a given event topic.
 * - SummarizeEventInput - The input type for the summarizeEvent function.
 * - SummarizeEventOutput - The return type for the summarizeEvent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeEventInputSchema = z.object({
  eventTopic: z
    .string()
    .describe('The topic of the event to summarize.'),
});
export type SummarizeEventInput = z.infer<typeof SummarizeEventInputSchema>;

const SummarizeEventOutputSchema = z.object({
  summary: z
    .string()
    .describe('A summarized version of the event on the given topic.'),
});
export type SummarizeEventOutput = z.infer<typeof SummarizeEventOutputSchema>;


/**
 * An async function that summarizes an event topic.
 * @param input The event topic to summarize.
 * @returns The summarized event.
 */
export async function summarizeEvent(
  input: SummarizeEventInput
): Promise<SummarizeEventOutput> {
  return summarizeEventFlow(input);
}


const summarizeEventPrompt = ai.definePrompt({
  name: 'summarizeEventPrompt',
  input: {schema: SummarizeEventInputSchema},
  output: {schema: SummarizeEventOutputSchema},
  prompt: `Provide a concise, neutral summary of the most important information related to the following event: {{{eventTopic}}}.`,
});


const summarizeEventFlow = ai.defineFlow(
  {
    name: 'summarizeEventFlow',
    inputSchema: SummarizeEventInputSchema,
    outputSchema: SummarizeEventOutputSchema,
  },
  async input => {
    const {output} = await summarizeEventPrompt(input);
    return output!;
  }
);
