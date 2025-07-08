'use server';

import { z } from 'zod';
import { ai } from '@/ai/genkit';

const ticketStatusSuggestion = ai.defineFlow(
  {
    name: 'ticketStatusSuggestion',
    inputSchema: z.object({ ticketSummary: z.string() }),
    outputSchema: z.string(),
  },
  async ({ ticketSummary }) => {
    try {
      const llmResponse = await ai.generate({
        prompt: `Based on the following ticket summary, suggest the next most likely status. The possible statuses are: Open, In Progress, Resolved, Closed. Return only the status name as a single string. For example: "In Progress". Summary: "${ticketSummary}"`,
        history: [],
      });

      const suggestedStatus = llmResponse.text.trim();

      const validStatuses = ['Open', 'In Progress', 'Resolved', 'Closed'];
      const foundStatus = validStatuses.find(s => suggestedStatus.includes(s));
      
      if (foundStatus) {
        return foundStatus;
      }

      // Fallback if the model response is not one of the valid statuses
      return 'In Progress';
    } catch (error) {
      console.error("Error in ticketStatusSuggestion flow:", error);
      // Return a sensible default in case of an error
      return 'In Progress';
    }
  }
);

export async function suggestStatus(ticketSummary: string) {
  return await ticketStatusSuggestion({ ticketSummary });
}
