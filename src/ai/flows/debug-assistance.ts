// src/ai/flows/debug-assistance.ts
'use server';
/**
 * @fileOverview Provides debugging assistance by identifying potential errors and suggesting fixes.
 *
 * - debugAssistance - A function that handles the debugging assistance process.
 * - DebugAssistanceInput - The input type for the debugAssistance function.
 * - DebugAssistanceOutput - The return type for the debugAssistance function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DebugAssistanceInputSchema = z.object({
  code: z.string().describe('The code snippet to be debugged.'),
  language: z.enum(['javascript', 'python']).describe('The programming language of the code snippet.'),
  description: z.string().optional().describe('Optional description of the issue or context.'),
});
export type DebugAssistanceInput = z.infer<typeof DebugAssistanceInputSchema>;

const DebugAssistanceOutputSchema = z.object({
  errors: z.array(z.string()).describe('A list of potential errors found in the code.'),
  suggestions: z.array(z.string()).describe('A list of suggested fixes for the identified errors.'),
  explanation: z.string().describe('An explanation of the errors and suggestions.'),
});
export type DebugAssistanceOutput = z.infer<typeof DebugAssistanceOutputSchema>;

export async function debugAssistance(input: DebugAssistanceInput): Promise<DebugAssistanceOutput> {
  return debugAssistanceFlow(input);
}

const debugAssistancePrompt = ai.definePrompt({
  name: 'debugAssistancePrompt',
  input: {schema: DebugAssistanceInputSchema},
  output: {schema: DebugAssistanceOutputSchema},
  prompt: `You are an AI code assistant that helps developers debug their code.

You will receive a code snippet, its programming language, and an optional description of the issue.
Your task is to identify potential errors in the code, suggest fixes, and provide an explanation of the errors and suggestions.

Language: {{{language}}}
Code:
\`\`\`{{{language}}}
{{code}}
\`\`\`

Description: {{{description}}}

Errors:
{{errors}}

Suggestions:
{{suggestions}}

Explanation: {{explanation}}`,
});

const debugAssistanceFlow = ai.defineFlow(
  {
    name: 'debugAssistanceFlow',
    inputSchema: DebugAssistanceInputSchema,
    outputSchema: DebugAssistanceOutputSchema,
  },
  async input => {
    const {output} = await debugAssistancePrompt(input);
    return output!;
  }
);
