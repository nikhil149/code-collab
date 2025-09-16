"use client";

import { useState, useTransition, useCallback, useRef, useEffect } from "react";
import AppHeader from "@/components/app-header";
import FileExplorer, { type FileNode } from "@/components/file-explorer";
import EditorPanel from "@/components/editor-panel";
import TerminalPanel from "@/components/terminal-panel";
import AiAssistantPanel from "@/components/ai-assistant-panel";
import { readFileContent } from "@/ai/flows/file-system";
import { useToast } from "@/hooks/use-toast";
import { GripHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

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

  const [terminalHeight, setTerminalHeight] = useState(250);
  const isResizing = useRef(false);
  const editorRef = useRef<HTMLDivElement>(null);


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

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        isResizing.current = true;
    }, []);

    const handleMouseUp = useCallback(() => {
        isResizing.current = false;
    }, []);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isResizing.current || !editorRef.current) return;
        
        const editorRect = editorRef.current.getBoundingClientRect();
        const newHeight = editorRect.bottom - e.clientY;

        if (newHeight > 50 && newHeight < window.innerHeight * 0.8) {
            setTerminalHeight(newHeight);
        }

    }, []);

    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [handleMouseMove, handleMouseUp]);


  return (
    <div className="flex h-screen flex-col bg-background text-foreground font-body">
      <AppHeader language={language} onLanguageChange={setLanguage} onCloneSuccess={setFileTree} />
      <main className="flex flex-1 overflow-hidden">
        <FileExplorer fileTree={fileTree} activeFile={activeFile} onFileSelect={handleFileSelect} />
        <div ref={editorRef} className="flex flex-1 flex-col min-w-0">
          <EditorPanel
            file={activeFile}
            code={code}
            onCodeChange={setCode}
            isLoading={isPending}
          />
           <div
              className={cn("group w-full h-2 flex items-center justify-center bg-border/50 cursor-row-resize transition-all", isResizing.current && "bg-primary/50" )}
              onMouseDown={handleMouseDown}
            >
              <GripHorizontal className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            </div>
          <TerminalPanel height={terminalHeight} />
        </div>
        <AiAssistantPanel code={code} language={language} />
      </main>
    </div>
  );
}
