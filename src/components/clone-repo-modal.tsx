import { ReactNode, useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GitBranch, LoaderCircle } from "lucide-react";
import { gitClone } from "@/ai/flows/git-clone";
import { useToast } from "@/hooks/use-toast";
import { type FileNode } from "./file-explorer";

interface CloneRepoModalProps {
    children: ReactNode;
    onCloneSuccess: (fileTree: FileNode[]) => void;
}

const CloneRepoModal = ({ children, onCloneSuccess }: CloneRepoModalProps) => {
    const { toast } = useToast();
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [repoUrl, setRepoUrl] = useState("https://github.com/firebase/genkit.git");

    const handleClone = () => {
        if (!repoUrl) return;
        startTransition(async () => {
            try {
                const result = await gitClone({ repoUrl });
                onCloneSuccess(result.fileTree);
                toast({
                    title: "Repository cloned!",
                    description: "The file explorer has been updated.",
                });
                setOpen(false);
            } catch (error: any) {
                 toast({
                    variant: "destructive",
                    title: "Uh oh! Something went wrong.",
                    description: error.message || "There was a problem cloning the repository.",
                });
            }
        });
    }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline flex items-center gap-2">
            <GitBranch className="h-5 w-5" /> Clone a Repository
          </DialogTitle>
          <DialogDescription>
            Enter the URL of a public Git repository to clone it into your editor.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="repo-url" className="text-right">
              URL
            </Label>
            <Input
              id="repo-url"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              className="col-span-3"
              disabled={isPending}
            />
          </div>
        </div>
        <DialogFooter>
            <DialogClose asChild>
                <Button type="button" variant="secondary" disabled={isPending}>
                    Cancel
                </Button>
            </DialogClose>
          <Button type="submit" onClick={handleClone} disabled={isPending || !repoUrl}>
            {isPending && <LoaderCircle className="animate-spin mr-2"/>}
            {isPending ? "Cloning..." : "Clone Repository"}
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CloneRepoModal;
