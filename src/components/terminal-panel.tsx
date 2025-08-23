'use client';

import { useState, useRef, useEffect, type FC } from 'react';
import { Terminal } from 'lucide-react';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';

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

    switch (command.trim()) {
      case 'git status':
        output = "On branch main. Your branch is up to date with 'origin/main'.\nNothing to commit, working tree clean.";
        break;
      case 'git pull':
        output = 'Already up to date.';
        break;
      case 'git push':
        output = 'Everything up-to-date.';
        break;
      case 'ls':
        output = 'public/\nsrc/\npackage.json\nREADME.md';
        break;
      case 'node src/main.js':
        // A very basic and unsafe way to "run" the code for this demo
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
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <span className="text-muted-foreground">$</span>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="h-auto flex-1 border-none bg-transparent p-0 focus-visible:ring-0"
              autoComplete="off"
            />
          </form>
        </div>
      </ScrollArea>
    </div>
  );
};

export default TerminalPanel;
