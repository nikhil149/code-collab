import type { FC } from "react";
import { Bot, ChevronDown, GitBranch, Share2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CloneRepoModal from "./clone-repo-modal";
import ShareSessionModal from "./share-session-modal";

interface AppHeaderProps {
  language: string;
  onLanguageChange: (language: string) => void;
}

const AppHeader: FC<AppHeaderProps> = ({ language, onLanguageChange }) => {
  const languages: Record<string, string> = {
    javascript: "JavaScript (Node.js)",
    python: "Python (CPython 3.11)",
  };

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b px-4 sm:px-6">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-primary">
            <Bot className="h-7 w-7" />
            <h1 className="text-xl font-bold font-headline text-foreground">
            Code Collab AI
            </h1>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="hidden md:flex">
              <span>{languages[language]}</span>
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => onLanguageChange("javascript")}>
              JavaScript (Node.js)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onLanguageChange("python")}>
              Python (CPython 3.11)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex items-center gap-3">
        <CloneRepoModal>
            <Button variant="outline">
                <GitBranch className="mr-2 h-4 w-4" />
                Clone
            </Button>
        </CloneRepoModal>

        <ShareSessionModal>
          <Button>
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        </ShareSessionModal>
        
        <div className="flex items-center -space-x-2">
            <Avatar className="h-9 w-9 border-2 border-background">
                <AvatarImage src="https://placehold.co/40x40.png" data-ai-hint="person face" />
                <AvatarFallback>U1</AvatarFallback>
            </Avatar>
            <Avatar className="h-9 w-9 border-2 border-background">
                <AvatarImage src="https://placehold.co/40x40.png" data-ai-hint="person face" />
                <AvatarFallback>U2</AvatarFallback>
            </Avatar>
            <Avatar className="h-9 w-9 border-2 border-background">
                <AvatarFallback>+2</AvatarFallback>
            </Avatar>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
