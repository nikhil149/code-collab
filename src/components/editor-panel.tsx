import type { FC } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { FileCode } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';

interface EditorPanelProps {
  file: string;
  code: string;
  onCodeChange: (code: string) => void;
}

const EditorPanel: FC<EditorPanelProps> = ({ file, code, onCodeChange }) => {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex h-10 items-center border-b bg-card px-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileCode className="h-4 w-4" />
          <span className="font-medium text-foreground">{file}</span>
        </div>
      </div>
      <ScrollArea className="flex-1 bg-card/50">
        <Textarea
          value={code}
          onChange={(e) => onCodeChange(e.target.value)}
          className="h-full w-full resize-none border-none bg-transparent font-code text-base leading-relaxed tracking-wide focus-visible:ring-0"
          placeholder="Write your code here..."
        />
      </ScrollArea>
    </div>
  );
};

export default EditorPanel;
