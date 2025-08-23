"use client";

import { useState, useTransition } from "react";
import AppHeader from "@/components/app-header";
import FileExplorer, { type FileNode } from "@/components/file-explorer";
import EditorPanel from "@/components/editor-panel";
import TerminalPanel from "@/components/terminal-panel";
import AiAssistantPanel from "@/components/ai-assistant-panel";
import { readFileContent } from "@/ai/flows/file-system";
import { useToast } from "@/hooks/use-toast";

const initialFileTree: FileNode[] = [
  {
    name: 'src',
    type: 'folder',
    path: '/src',
    children: [
      { name: 'components', type: 'folder', path: '/src/components', children: [
        { name: 'button.js', type: 'file', path: '/src/components/button.js' },
        { name: 'modal.js', type: 'file', path: '/src/components/modal.js' },
      ]},
      { name: 'main.js', type: 'file', path: '/src/main.js' },
      { name: 'api.js', type: 'file', path: '/src/api.js' },
    ],
  },
    { name: 'public', type: 'folder', path: '/public', children: [
        { name: 'index.html', type: 'file', path: '/public/index.html' },
    ]},
  { name: 'package.json', type: 'file', path: '/package.json' },
  { name: 'README.md', type: 'file', path: '/README.md' },
];


const initialCode = `// Welcome to Code Collab AI!
// Clone a repository or select a file to start editing.
// Use the AI Assistant on the right for help.

function fibonacci(n) {
  if (n <= 1) {
    return n;
  }
  return fibonacci(n - 1) + fibonacci(n - 2);
}

const result = fibonacci(10);
console.log(\`Fibonacci(10) is \${result}\`);
`;

export default function Home() {
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState(initialCode);
  const [activeFile, setActiveFile] = useState("");
  const [fileTree, setFileTree] = useState<FileNode[]>(initialFileTree);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleFileSelect = (filePath: string) => {
    setActiveFile(filePath);
    startTransition(async () => {
        try {
            const { content } = await readFileContent({ filePath });
            setCode(content);
        } catch (error: any) {
            console.error("Failed to read file", error);
            toast({
                variant: "destructive",
                title: "Error reading file",
                description: error.message,
            })
            setCode(`// Error loading file: ${filePath}`);
        }
    })
  };

  return (
    <div className="flex h-screen flex-col bg-background text-foreground font-body">
      <AppHeader language={language} onLanguageChange={setLanguage} onCloneSuccess={setFileTree} />
      <main className="flex flex-1 overflow-hidden">
        <FileExplorer fileTree={fileTree} activeFile={activeFile} onFileSelect={handleFileSelect} />
        <div className="flex flex-1 flex-col min-w-0">
          <EditorPanel
            file={activeFile}
            code={code}
            onCodeChange={setCode}
            isLoading={isPending}
          />
          <TerminalPanel code={code} />
        </div>
        <AiAssistantPanel code={code} language={language} />
      </main>
    </div>
  );
}
