'use client';

import { useState, useRef, useEffect, type FC, useTransition } from 'react';
import { Terminal, LoaderCircle } from 'lucide-react';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { gitCommit } from '@/ai/flows/file-system';
import { useToast } from '@/hooks/use-toast';
import { Button } from './ui/button';

interface TerminalPanelProps {
    code: string;
}

interface LogEntry {
  type: 'command' | 'output';
  content: string;
}

const TerminalPanel: FC<TerminalPanelProps> = ({ code }) => {
  const [input, setInput] = useState('');
  const [log, setLog] = useState<LogEntry[]>([
    { type: 'output', content: 'Welcome to the integrated terminal.' },
    { type: 'output', content: "You can run git commands or execute your code (e.g. 'node src/main.js')." },
  ]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('div');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [log]);

  const handleCommand = (command: string) => {
    const newLog: LogEntry[] = [...log, { type: 'command', content: command }];
    let output = '';

    if (command.trim() === 'clear') {
        setLog([]);
        return;
    }
    
    if (command.startsWith('git commit')) {
      handleGitCommit(command);
      return;
    }

    switch (command.trim()) {
      case 'git status':
        output = "On branch main. Your branch is up to date with 'origin/main'.\nChanges not staged for commit:\n  (use \"git add <file>...\" to update what will be committed)\n\n\tmodified: ...\n\nno changes added to commit (use \"git add\" and/or \"git commit -a\")";
        break;
      case 'git pull':
        output = 'Already up to date.';
        break;
      case 'git push':
        output = 'Everything up-to-date. In a real app, this would push to the remote repository.';
        break;
      case 'ls':
        output = 'public/\nsrc/\npackage.json\nREADME.md';
        break;
      case 'node src/main.js':
        try {
            const funcStr = code.slice(code.indexOf('function'));
            const evalFunc = new Function(`return ${funcStr}`)();
            const result = evalFunc(10);
            output = `Fibonacci(10) is ${result}`;
        } catch (e: any) {
            output = `Error: ${e.message}`;
        }
        break;
      default:
        output = `command not found: ${command}`;
    }
    setLog([...newLog, { type: 'output', content: output }]);
  };

  const handleGitCommit = (command: string) => {
    const match = command.match(/git commit -m "(.*)"/);
    if (!match || !match[1]) {
        setLog([...log, { type: 'command', content: command }, { type: 'output', content: 'Invalid commit command. Use: git commit -m "Your message"' }]);
        return;
    }
    const message = match[1];
    setLog(prev => [...prev, { type: 'command', content: command }])

    startTransition(async () => {
        try {
            const result = await gitCommit({ message });
            setLog(prev => [...prev, { type: 'output', content: result.output }]);
            toast({
                title: "Commit successful!",
                description: "Your changes have been committed.",
            });
        } catch (error: any) {
             toast({
                variant: "destructive",
                title: "Commit failed",
                description: error.message,
            });
             setLog(prev => [...prev, { type: 'output', content: `Error: ${error.message}` }])
        }
    })
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input) return;
    handleCommand(input);
    setInput('');
  };

  return (
    <div className="h-56 shrink-0 border-t bg-card">
      <div className="flex h-10 items-center justify-between border-b px-4">
        <div className="flex items-center gap-2">
          <Terminal className="h-5 w-5" />
          <h3 className="font-semibold font-headline">Terminal</h3>
        </div>
      </div>
      <ScrollArea className="h-[calc(100%-2.5rem)]" ref={scrollAreaRef}>
        <div className="p-4 font-code text-sm">
          {log.map((entry, index) => (
            <div key={index} className="whitespace-pre-wrap">
              {entry.type === 'command' && <span className="text-muted-foreground">$ </span>}
              <span>{entry.content}</span>
            </div>
          ))}
          {isPending && (
             <div className="flex items-center gap-2">
                <LoaderCircle className="animate-spin h-4 w-4"/>
                <span>Running command...</span>
             </div>
          )}
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <span className="text-muted-foreground">$</span>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="h-auto flex-1 border-none bg-transparent p-0 focus-visible:ring-0"
              autoComplete="off"
              disabled={isPending}
            />
          </form>
        </div>
      </ScrollArea>
    </div>
  );
};

export default TerminalPanel;
