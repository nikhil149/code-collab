import { FC, useState, useTransition } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { FileCode, LoaderCircle, Save } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';
import { writeFileContent } from '@/ai/flows/file-system';
import { useToast } from '@/hooks/use-toast';

interface EditorPanelProps {
  file: string;
  code: string;
  onCodeChange: (code: string) => void;
  isLoading: boolean;
}

const EditorPanel: FC<EditorPanelProps> = ({ file, code, onCodeChange, isLoading }) => {
  const { toast } = useToast();
  const [isSaving, startTransition] = useTransition();

  const handleSave = () => {
    if (!file) return;
    startTransition(async () => {
      try {
        await writeFileContent({ filePath: file, content: code });
        toast({
          title: "File saved!",
          description: `Successfully saved ${file}`,
        });
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error saving file",
          description: error.message,
        });
      }
    });
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex h-10 items-center justify-between border-b bg-card px-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {isLoading ? (
             <LoaderCircle className="h-4 w-4 animate-spin" />
          ) : (
            <FileCode className="h-4 w-4" />
          )}
          <span className="font-medium text-foreground">{file}</span>
        </div>
        {file && (
          <Button variant="ghost" size="sm" onClick={handleSave} disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        )}
      </div>
      <ScrollArea className="flex-1 bg-card/50">
        <Textarea
          value={isLoading ? "Loading file..." : code}
          onChange={(e) => onCodeChange(e.target.value)}
          className="h-full w-full resize-none border-none bg-transparent font-code text-base leading-relaxed tracking-wide focus-visible:ring-0"
          placeholder="Write your code here..."
          disabled={isLoading || isSaving}
        />
      </ScrollArea>
    </div>
  );
};

export default EditorPanel;
