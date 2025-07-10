'use server';

import { z } from 'zod';
import { ai } from '@/ai/genkit';

const ticketSummaryInputSchema = z.object({
  description: z.string(),
  agentResponse: z.string().optional(),
});

const ticketSummarization = ai.defineFlow(
  {
    name: 'ticketSummarization',
    inputSchema: ticketSummaryInputSchema,
    outputSchema: z.string(),
  },
  async ({ description, agentResponse }) => {
    try {
      const llmResponse = await ai.generate({
        prompt: `Based on the following ticket description and agent response, generate a concise, one-sentence summary of the resolution. If there is no agent response, summarize the problem.

        Description: "${description}"
        
        Agent Response: "${agentResponse || 'Not provided'}"
        
        Return only the summary as a single string.`,
        history: [],
      });

      return llmResponse.text.trim();
    } catch (error) {
      console.error("Error in ticketSummarization flow:", error);
      return 'Could not generate summary.';
    }
  }
);

export async function summarizeTicket(input: { description: string; agentResponse?: string }) {
  return await ticketSummarization(input);
}
