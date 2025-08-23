// src/ai/flows/code-refinement.ts
'use server';

/**
 * @fileOverview A code refinement AI agent.
 *  The agent provides suggestions for code optimization and alternative implementations to improve code quality and efficiency.
 *
 * - refineCode - A function that handles the code refinement process.
 * - RefineCodeInput - The input type for the refineCode function.
 * - RefineCodeOutput - The return type for the refineCode function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RefineCodeInputSchema = z.object({
  code: z.string().describe('The code to be refined.'),
  language: z.string().describe('The programming language of the code.'),
});
export type RefineCodeInput = z.infer<typeof RefineCodeInputSchema>;

const RefineCodeOutputSchema = z.object({
  refinedCode: z.string().describe('The refined code with suggestions.'),
  explanation: z.string().describe('Explanation of the changes made and suggestions for further improvements.'),
});
export type RefineCodeOutput = z.infer<typeof RefineCodeOutputSchema>;

export async function refineCode(input: RefineCodeInput): Promise<RefineCodeOutput> {
  return refineCodeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'refineCodePrompt',
  input: {schema: RefineCodeInputSchema},
  output: {schema: RefineCodeOutputSchema},
  prompt: `You are an expert code reviewer and optimizer. You will receive code and provide suggestions for improvement.

      Specifically, you should focus on:
      - Improving code readability
      - Suggesting alternative implementations that are more efficient
      - Identifying potential bugs or security vulnerabilities
      - Ensuring code adheres to best practices for the specified language

      Language: {{{language}}}

      Code:
      \`\`\`{{{language}}}
      {{{code}}}
      \`\`\`

      Provide the refined code, and then provide a detailed explanation of the changes you made and suggestions for further improvements.
      Make sure to return valid code.
      The refined code should be complete and executable.
      Ensure all variables are properly defined, and all functions used are implemented.
      `,
});

const refineCodeFlow = ai.defineFlow(
  {
    name: 'refineCodeFlow',
    inputSchema: RefineCodeInputSchema,
    outputSchema: RefineCodeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
