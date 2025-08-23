import { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GitBranch } from "lucide-react";

interface CloneRepoModalProps {
    children: ReactNode;
}

const CloneRepoModal = ({ children }: CloneRepoModalProps) => {
  return (
    <Dialog>
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
              defaultValue="https://github.com/facebook/react.git"
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">Clone Repository</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CloneRepoModal;
