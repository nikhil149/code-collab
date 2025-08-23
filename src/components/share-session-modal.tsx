"use client";

import { useState, useEffect, type ReactNode } from "react";
import { Copy, Share2 } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";

interface ShareSessionModalProps {
  children: ReactNode;
}

const ShareSessionModal = ({ children }: ShareSessionModalProps) => {
  const [shareUrl, setShareUrl] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    setShareUrl(window.location.href);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: "Copied to clipboard!",
      description: "You can now share the link with your collaborators.",
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="font-headline flex items-center gap-2">
            <Share2 className="h-5 w-5" /> Share Session
          </DialogTitle>
          <DialogDescription>
            Anyone with this link can join your collaborative session.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center space-x-2">
            <div className="grid flex-1 gap-2">
                <Label htmlFor="link" className="sr-only">
                    Link
                </Label>
                <Input
                    id="link"
                    defaultValue={shareUrl}
                    readOnly
                />
            </div>
            <Button type="button" size="icon" onClick={handleCopy} disabled={!shareUrl}>
                <span className="sr-only">Copy</span>
                <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <DialogFooter>
          <span className="text-sm text-muted-foreground">This session is ready for collaboration.</span>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ShareSessionModal;
