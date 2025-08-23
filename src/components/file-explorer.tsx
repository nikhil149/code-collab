import type { FC } from 'react';
import { Folder, FileCode, FolderOpen } from 'lucide-react';
import { Button } from './ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { cn } from '@/lib/utils';
import { ScrollArea } from './ui/scroll-area';

interface FileExplorerProps {
  activeFile: string;
  onFileSelect: (path: string) => void;
}

const fileTree = [
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

const FileExplorer: FC<FileExplorerProps> = ({ activeFile, onFileSelect }) => {

  const renderTree = (nodes: any[], level = 0) => {
    return nodes.map(node => {
      const isActive = activeFile === node.path;
      if (node.type === 'folder') {
        return (
          <Collapsible key={node.path} defaultOpen={level < 1}>
            <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-start gap-2 h-8 px-2">
                    <Folder className="h-4 w-4 text-primary" />
                    <span className="font-normal">{node.name}</span>
                </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div style={{ paddingLeft: `${(level + 1) * 12}px` }} className="flex flex-col">
                {renderTree(node.children, level + 1)}
              </div>
            </CollapsibleContent>
          </Collapsible>
        );
      }
      return (
        <Button
          key={node.path}
          variant="ghost"
          className={cn(
            'w-full justify-start gap-2 h-8 px-2',
            isActive && 'bg-accent/30 text-accent-foreground'
          )}
          onClick={() => onFileSelect(node.path)}
          style={{ paddingLeft: `${(level) * 12 + 4}px` }}
        >
          <FileCode className="h-4 w-4 text-muted-foreground" />
          <span className="font-normal">{node.name}</span>
        </Button>
      );
    });
  };

  return (
    <aside className="w-64 shrink-0 border-r bg-card p-2 hidden md:flex flex-col">
      <h2 className="p-2 text-lg font-headline font-semibold tracking-tight">
        Explorer
      </h2>
      <ScrollArea className="flex-1">
        <div className="flex flex-col text-sm space-y-1">
          {renderTree(fileTree)}
        </div>
      </ScrollArea>
    </aside>
  );
};

export default FileExplorer;
