"use client";

import { useState, useTransition, type FC } from "react";
import { Bot, Bug, MessageSquareQuote, Wand2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { ScrollArea } from "./ui/scroll-area";
import { Skeleton } from "./ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  explainCode,
  type ExplainCodeOutput,
} from "@/ai/flows/code-explanation";
import {
  debugAssistance,
  type DebugAssistanceOutput,
} from "@/ai/flows/debug-assistance";
import {
  refineCode,
  type RefineCodeOutput,
} from "@/ai/flows/code-refinement";

interface AiAssistantPanelProps {
  code: string;
  language: string;
}

type AiOutput = ExplainCodeOutput | DebugAssistanceOutput | RefineCodeOutput;

const AiAssistantPanel: FC<AiAssistantPanelProps> = ({ code, language }) => {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [output, setOutput] = useState<AiOutput | null>(null);
  const [activeTab, setActiveTab] = useState("explain");
  const [currentCode, setCurrentCode] = useState(code);

  const handleSubmit = (flow: "explain" | "debug" | "refine") => {
    setOutput(null);
    startTransition(async () => {
      try {
        let result: AiOutput | null = null;
        if (flow === "explain") {
          result = await explainCode({ code: currentCode });
        } else if (flow === "debug") {
          result = await debugAssistance({ code: currentCode, language, description: "" });
        } else if (flow === "refine") {
          result = await refineCode({ code: currentCode, language });
        }
        setOutput(result);
      } catch (error) {
        console.error("AI flow failed:", error);
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: "There was a problem with the AI request.",
        });
      }
    });
  };
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setCurrentCode(code);
    setOutput(null);
  }

  const renderOutput = () => {
    if (isPending) {
      return (
        <div className="space-y-4 mt-4">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-16 w-full" />
        </div>
      );
    }

    if (!output) {
      return (
        <div className="text-center text-sm text-muted-foreground mt-8">
          <Bot className="mx-auto h-10 w-10 mb-2" />
          <p>The AI Assistant is ready to help.</p>
          <p>Paste your code and choose an action.</p>
        </div>
      );
    }
    
    if ('explanation' in output && 'refinedCode' in output) { // RefineCodeOutput
        return (
            <div>
                <h4 className="font-semibold mt-4 mb-2">Refined Code:</h4>
                <ScrollArea className="h-48">
                  <pre className="bg-muted p-3 rounded-md text-sm font-code overflow-x-auto"><code>{output.refinedCode}</code></pre>
                </ScrollArea>
                <h4 className="font-semibold mt-4 mb-2">Explanation:</h4>
                <ScrollArea className="h-48">
                  <p className="text-sm whitespace-pre-wrap pr-4">{output.explanation}</p>
                </ScrollArea>
            </div>
        );
    }
    
    if ('errors' in output) { // DebugAssistanceOutput
        return (
            <div>
                <h4 className="font-semibold mt-4 mb-2">Potential Errors:</h4>
                 <ScrollArea className="h-24">
                    <ul className="list-disc list-inside text-sm text-destructive pr-4">
                        {output.errors.map((err, i) => <li key={i}>{err}</li>)}
                    </ul>
                </ScrollArea>
                <h4 className="font-semibold mt-4 mb-2">Suggestions:</h4>
                <ScrollArea className="h-24">
                    <ul className="list-disc list-inside text-sm pr-4">
                        {output.suggestions.map((sug, i) => <li key={i}>{sug}</li>)}
                    </ul>
                </ScrollArea>
                <h4 className="font-semibold mt-4 mb-2">Explanation:</h4>
                <ScrollArea className="h-32">
                    <p className="text-sm whitespace-pre-wrap pr-4">{output.explanation}</p>
                </ScrollArea>
            </div>
        );
    }
    
    if ('explanation' in output) { // ExplainCodeOutput
        return (
            <div>
                <h4 className="font-semibold mt-4 mb-2">Explanation:</h4>
                <ScrollArea className="h-96">
                    <p className="text-sm whitespace-pre-wrap pr-4">{output.explanation}</p>
                </ScrollArea>
            </div>
        );
    }

    return null;
  };

  return (
    <aside className="w-96 shrink-0 border-l bg-card hidden lg:flex flex-col">
      <div className="flex h-16 items-center border-b px-4">
        <div className="flex items-center gap-2">
          <Bot className="h-6 w-6 text-primary" />
          <h2 className="text-lg font-headline font-semibold">
            AI Assistant
          </h2>
        </div>
      </div>
      <Tabs value={activeTab} onValueChange={handleTabChange} className="flex-1 flex flex-col">
        <TabsList className="m-2 grid w-auto grid-cols-3">
          <TabsTrigger value="explain"><MessageSquareQuote className="w-4 h-4 mr-2"/>Explain</TabsTrigger>
          <TabsTrigger value="debug"><Bug className="w-4 h-4 mr-2"/>Debug</TabsTrigger>
          <TabsTrigger value="refine"><Wand2 className="w-4 h-4 mr-2"/>Refine</TabsTrigger>
        </TabsList>
        <ScrollArea className="flex-1">
          <div className="p-4">
              <Textarea
                value={currentCode}
                onChange={(e) => setCurrentCode(e.target.value)}
                className="h-48 font-code text-sm"
                placeholder="Paste your code here to get AI assistance."
              />
              <Button onClick={() => handleSubmit(activeTab as any)} disabled={isPending || !currentCode} className="w-full mt-2">
                {isPending ? "Thinking..." : `Run ${activeTab}`}
              </Button>
            
            <Card className="mt-4 bg-background/50 border-dashed">
                <CardContent className="p-4">
                    {renderOutput()}
                </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </Tabs>
    </aside>
  );
};

export default AiAssistantPanel;
