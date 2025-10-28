
'use server';

/**
 * @fileOverview An AI agent that summarizes news topics and suggests them.
 *
 * - summarizeNewsTopic - A function that summarizes a given news topic.
 * - suggestNewsTopic - A function that suggests a random news topic.
 * - SummarizeNewsTopicInput - The input type for the summarizeNewsTopic function.
 * - SummarizeNewsTopicOutput - The return type for the summarizeNewsTopic function.
 * - SuggestNewsTopicOutput - The return type for the suggestNewsTopic function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Schema for summarizing a news topic
const SummarizeNewsTopicInputSchema = z.object({
  newsTopic: z
    .string()
    .describe('The topic of the news to summarize.'),
});
export type SummarizeNewsTopicInput = z.infer<typeof SummarizeNewsTopicInputSchema>;

const SummarizeNewsTopicOutputSchema = z.object({
  summary: z
    .string()
    .describe('A summarized version of the news on the given topic.'),
});
export type SummarizeNewsTopicOutput = z.infer<typeof SummarizeNewsTopicOutputSchema>;

// Schema for suggesting a news topic
const SuggestNewsTopicOutputSchema = z.object({
  suggestion: z.string().describe('A suggested news topic.'),
});
export type SuggestNewsTopicOutput = z.infer<typeof SuggestNewsTopicOutputSchema>;

/**
 * An async function that summarizes a news topic.
 * @param input The news topic to summarize.
 * @returns The summarized news.
 */
export async function summarizeNewsTopic(
  input: SummarizeNewsTopicInput
): Promise<SummarizeNewsTopicOutput> {
  return summarizeNewsTopicFlow(input);
}

/**
 * An async function that suggests a random, interesting news topic.
 * @returns A suggested news topic.
 */
export async function suggestNewsTopic(): Promise<SuggestNewsTopicOutput> {
    return suggestNewsTopicFlow();
}

const summarizeNewsTopicPrompt = ai.definePrompt({
  name: 'summarizeNewsTopicPrompt',
  input: {schema: SummarizeNewsTopicInputSchema},
  output: {schema: SummarizeNewsTopicOutputSchema},
  prompt: `Provide a concise, neutral summary of the most important recent events related to the following topic: {{{newsTopic}}}.`,
});

const suggestNewsTopicPrompt = ai.definePrompt({
    name: 'suggestNewsTopicPrompt',
    output: {schema: SuggestNewsTopicOutputSchema},
    prompt: `Suggest one interesting and specific news topic. For example: "the impact of AI on the film industry" or "recent discoveries in deep-sea exploration".`,
});

const summarizeNewsTopicFlow = ai.defineFlow(
  {
    name: 'summarizeNewsTopicFlow',
    inputSchema: SummarizeNewsTopicInputSchema,
    outputSchema: SummarizeNewsTopicOutputSchema,
  },
  async input => {
    const {output} = await summarizeNewsTopicPrompt(input);
    return output!;
  }
);

const suggestNewsTopicFlow = ai.defineFlow(
  {
    name: 'suggestNewsTopicFlow',
    outputSchema: SuggestNewsTopicOutputSchema,
  },
  async () => {
    const {output} = await suggestNewsTopicPrompt();
    return output!;
  }
);
