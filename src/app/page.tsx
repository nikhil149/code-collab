"use client";

import { useState } from "react";
import AppHeader from "@/components/app-header";
import FileExplorer from "@/components/file-explorer";
import EditorPanel from "@/components/editor-panel";
import TerminalPanel from "@/components/terminal-panel";
import AiAssistantPanel from "@/components/ai-assistant-panel";

const initialCode = `// Welcome to Code Collab AI!
// Select a file on the left to start editing.
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
  const [activeFile, setActiveFile] = useState("/src/main.js");

  const handleFileSelect = (file: string) => {
    setActiveFile(file);
    // In a real app, you'd fetch the file content here.
    // For now, we'll just reset the code.
    setCode(`// File: ${file}\n\n` + initialCode);
  };

  return (
    <div className="flex h-screen flex-col bg-background text-foreground font-body">
      <AppHeader language={language} onLanguageChange={setLanguage} />
      <main className="flex flex-1 overflow-hidden">
        <FileExplorer activeFile={activeFile} onFileSelect={handleFileSelect} />
        <div className="flex flex-1 flex-col min-w-0">
          <EditorPanel
            file={activeFile}
            code={code}
            onCodeChange={setCode}
          />
          <TerminalPanel code={code} />
        </div>
        <AiAssistantPanel code={code} language={language} />
      </main>
    </div>
  );
}
