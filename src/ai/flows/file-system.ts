// This file uses server-side code.
'use server';

/**
 * @fileOverview Handles file system operations within the workspace.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';

const execAsync = promisify(exec);

const WORKSPACE_DIR = path.join(process.cwd(), 'workspace');

// Read File Content
const ReadFileContentInputSchema = z.object({
  filePath: z.string().describe('The path of the file to read.'),
});
export type ReadFileContentInput = z.infer<typeof ReadFileContentInputSchema>;

const ReadFileContentOutputSchema = z.object({
  content: z.string().describe('The content of the file.'),
});
export type ReadFileContentOutput = z.infer<typeof ReadFileContentOutputSchema>;

export async function readFileContent(input: ReadFileContentInput): Promise<ReadFileContentOutput> {
  return readFileContentFlow(input);
}

const readFileContentFlow = ai.defineFlow(
  {
    name: 'readFileContentFlow',
    inputSchema: ReadFileContentInputSchema,
    outputSchema: ReadFileContentOutputSchema,
  },
  async ({ filePath }) => {
    try {
      const fullPath = path.join(WORKSPACE_DIR, filePath);
      const content = await fs.readFile(fullPath, 'utf-8');
      return { content };
    } catch (error: any) {
      console.error('Read file failed:', error);
      throw new Error(`Failed to read file: ${error.message}`);
    }
  }
);


// Write File Content
const WriteFileContentInputSchema = z.object({
    filePath: z.string().describe('The path of the file to write to.'),
    content: z.string().describe('The new content of the file.'),
});
export type WriteFileContentInput = z.infer<typeof WriteFileContentInputSchema>;

const WriteFileContentOutputSchema = z.object({
    success: z.boolean(),
});
export type WriteFileContentOutput = z.infer<typeof WriteFileContentOutputSchema>;

export async function writeFileContent(input: WriteFileContentInput): Promise<WriteFileContentOutput> {
    return writeFileContentFlow(input);
}

const writeFileContentFlow = ai.defineFlow(
    {
        name: 'writeFileContentFlow',
        inputSchema: WriteFileContentInputSchema,
        outputSchema: WriteFileContentOutputSchema,
    },
    async ({ filePath, content }) => {
        try {
            const fullPath = path.join(WORKSPACE_DIR, filePath);
            await fs.writeFile(fullPath, content, 'utf-8');
            return { success: true };
        } catch (error: any) {
            console.error('Write file failed:', error);
            throw new Error(`Failed to write file: ${error.message}`);
        }
    }
);

// Git Commit
const GitCommitInputSchema = z.object({
  message: z.string().describe('The commit message.'),
});
export type GitCommitInput = z.infer<typeof GitCommitInputSchema>;

const GitCommitOutputSchema = z.object({
  output: z.string().describe('The output from the git commit command.'),
});
export type GitCommitOutput = z.infer<typeof GitCommitOutputSchema>;

export async function gitCommit(input: GitCommitInput): Promise<GitCommitOutput> {
    return gitCommitFlow(input);
}

const gitCommitFlow = ai.defineFlow(
  {
    name: 'gitCommitFlow',
    inputSchema: GitCommitInputSchema,
    outputSchema: GitCommitOutputSchema,
  },
  async ({ message }) => {
    try {
      // Add all changes before committing
      await execAsync(`git add .`, { cwd: WORKSPACE_DIR });
      const { stdout } = await execAsync(`git commit -m "${message}"`, { cwd: WORKSPACE_DIR });
      return { output: stdout };
    } catch (error: any) {
      console.error('Git commit failed:', error);
      // It's common for git commit to return a non-zero exit code with output to stderr even on "success" (e.g. nothing to commit)
      // So we return the error message to the user to see.
      return { output: error.stderr || error.message };
    }
  }
);
