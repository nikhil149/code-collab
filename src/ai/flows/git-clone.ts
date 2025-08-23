// This file uses server-side code.
'use server';

/**
 * @fileOverview Clones a git repository.
 *
 * - gitClone - A function that accepts a repository URL and clones it.
 * - GitCloneInput - The input type for the gitClone function.
 * - GitCloneOutput - The return type for the gitClone function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';

const execAsync = promisify(exec);

const GitCloneInputSchema = z.object({
  repoUrl: z.string().describe('The URL of the Git repository to clone.'),
});
export type GitCloneInput = z.infer<typeof GitCloneInputSchema>;

const FileNodeSchema = z.object({
  name: z.string(),
  path: z.string(),
  type: z.enum(['file', 'folder']),
  children: z.lazy(() => FileNodeSchema.array()).optional(),
});

export type FileNode = z.infer<typeof FileNodeSchema>;

const GitCloneOutputSchema = z.object({
  fileTree: z.array(FileNodeSchema).describe('The file structure of the cloned repository.'),
});
export type GitCloneOutput = z.infer<typeof GitCloneOutputSchema>;

const WORKSPACE_DIR = path.join(process.cwd(), 'workspace');

async function getFileTree(dir: string, rootDir: string): Promise<FileNode[]> {
    const dirents = await fs.readdir(dir, { withFileTypes: true });
    const files: FileNode[] = await Promise.all(
      dirents
        .filter(dirent => dirent.name !== '.git')
        .map(async (dirent) => {
            const res = path.resolve(dir, dirent.name);
            const relativePath = path.relative(rootDir, res);
            if (dirent.isDirectory()) {
                return {
                    name: dirent.name,
                    type: 'folder',
                    path: `/${relativePath}`,
                    children: await getFileTree(res, rootDir),
                };
            } else {
                return {
                    name: dirent.name,
                    type: 'file',
                    path: `/${relativePath}`,
                };
            }
        })
    );
    return files;
}

export async function gitClone(input: GitCloneInput): Promise<GitCloneOutput> {
  return gitCloneFlow(input);
}

const gitCloneFlow = ai.defineFlow(
  {
    name: 'gitCloneFlow',
    inputSchema: GitCloneInputSchema,
    outputSchema: GitCloneOutputSchema,
  },
  async ({ repoUrl }) => {
    try {
        // Create workspace directory if it doesn't exist
        await fs.mkdir(WORKSPACE_DIR, { recursive: true });

        // Clear the workspace directory
        await fs.rm(WORKSPACE_DIR, { recursive: true, force: true });
        await fs.mkdir(WORKSPACE_DIR, { recursive: true });

        // Clone the repository
        await execAsync(`git clone --depth 1 ${repoUrl} .`, { cwd: WORKSPACE_DIR });

        const fileTree = await getFileTree(WORKSPACE_DIR, WORKSPACE_DIR);

        return { fileTree };
    } catch (error: any) {
        console.error('Git clone failed:', error);
        throw new Error(`Failed to clone repository: ${error.message}`);
    }
  }
);
