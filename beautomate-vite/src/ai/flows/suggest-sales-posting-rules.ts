'use server';

/**
 * @fileOverview AI-powered sales posting rules suggestion flow.
 *
 * - suggestSalesPostingRules - A function that suggests efficient sales posting rules based on client configuration.
 * - SuggestSalesPostingRulesInput - The input type for the suggestSalesPostingRules function.
 * - SuggestSalesPostingRulesOutput - The return type for the suggestSalesPostingRules function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestSalesPostingRulesInputSchema = z.object({
  clientConfiguration: z
    .string()
    .describe("The client's configuration details, including systems used, business type, and any specific accounting requirements."),
});
export type SuggestSalesPostingRulesInput = z.infer<typeof SuggestSalesPostingRulesInputSchema>;

const SuggestSalesPostingRulesOutputSchema = z.object({
  salesPostingMethod: z
    .string()
    .describe('The suggested sales posting method (e.g., Journal Entry, Itemized Invoice).'),
  batchClearingAccount: z.string().describe('The suggested batch clearing account.'),
  includeZeroSalesLines: z
    .boolean()
    .describe('Whether to include zero sales lines in the posting.'),
  memoFormat: z.string().describe('The suggested memo format.'),
  accountMappingSuggestions: z
    .record(z.string(), z.string())
    .describe('Suggested account mappings for various items.'),
});
export type SuggestSalesPostingRulesOutput = z.infer<typeof SuggestSalesPostingRulesOutputSchema>;

export async function suggestSalesPostingRules(input: SuggestSalesPostingRulesInput): Promise<SuggestSalesPostingRulesOutput> {
  return suggestSalesPostingRulesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestSalesPostingRulesPrompt',
  input: {schema: SuggestSalesPostingRulesInputSchema},
  output: {schema: SuggestSalesPostingRulesOutputSchema},
  prompt: `You are an expert accounting consultant specializing in sales posting rules for integrating POS systems with accounting software.

  Based on the client's configuration, suggest the most efficient sales posting rules.
  Consider the following client configuration:
  {{{clientConfiguration}}}

  Provide the sales posting method, batch clearing account, whether to include zero sales lines, the memo format, and suggested account mappings.

  Ensure the output is valid JSON.
  `,
});

const suggestSalesPostingRulesFlow = ai.defineFlow(
  {
    name: 'suggestSalesPostingRulesFlow',
    inputSchema: SuggestSalesPostingRulesInputSchema,
    outputSchema: SuggestSalesPostingRulesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
