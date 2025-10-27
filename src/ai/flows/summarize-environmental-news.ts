'use server';

/**
 * @fileOverview An AI agent that summarizes environmental and nature news.
 *
 * - summarizeEnvironmentalNews - A function that summarizes environmental news.
 * - SummarizeEnvironmentalNewsInput - The input type for the summarizeEnvironmentalNews function.
 * - SummarizeEnvironmentalNewsOutput - The return type for the summarizeEnvironmentalNews function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeEnvironmentalNewsInputSchema = z.object({
  newsTopic: z
    .string()
    .default('environmental and nature news')
    .describe('The topic of the news to summarize.'),
});
export type SummarizeEnvironmentalNewsInput = z.infer<
  typeof SummarizeEnvironmentalNewsInputSchema
>;

const SummarizeEnvironmentalNewsOutputSchema = z.object({
  summary: z
    .string()
    .describe('A summarized version of the environmental news.'),
});
export type SummarizeEnvironmentalNewsOutput = z.infer<
  typeof SummarizeEnvironmentalNewsOutputSchema
>;

export async function summarizeEnvironmentalNews(
  input: SummarizeEnvironmentalNewsInput
): Promise<SummarizeEnvironmentalNewsOutput> {
  return summarizeEnvironmentalNewsFlow(input);
}

const summarizeEnvironmentalNewsPrompt = ai.definePrompt({
  name: 'summarizeEnvironmentalNewsPrompt',
  input: {schema: SummarizeEnvironmentalNewsInputSchema},
  output: {schema: SummarizeEnvironmentalNewsOutputSchema},
  prompt: `Summarize the following news topic: {{{newsTopic}}}.\nGive a concise summary.`,
});

const summarizeEnvironmentalNewsFlow = ai.defineFlow(
  {
    name: 'summarizeEnvironmentalNewsFlow',
    inputSchema: SummarizeEnvironmentalNewsInputSchema,
    outputSchema: SummarizeEnvironmentalNewsOutputSchema,
  },
  async input => {
    const {output} = await summarizeEnvironmentalNewsPrompt(input);
    return output!;
  }
);
