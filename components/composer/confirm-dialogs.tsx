"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ConfirmProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DISCARD_COPY = {
  "failed-save": {
    title: "Your latest edits aren't saved",
    description: "The last save failed, so closing now loses the most recent changes. Keep editing to fix the problem and retry.",
  },
  "unsaved-published": {
    title: "Save your changes to the website?",
    description: "This post is already published. Your edits only reach the website article once you save them.",
  },
} as const;

interface DiscardProps {
  reason: keyof typeof DISCARD_COPY | null;
  onOpenChange: (open: boolean) => void;
  onDiscard: () => void;
  onSave?: () => void;
}

export function DiscardDialog({ reason, onOpenChange, onDiscard, onSave }: DiscardProps) {
  const copy = DISCARD_COPY[reason ?? "failed-save"];
  return (
    <AlertDialog open={reason !== null} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{copy.title}</AlertDialogTitle>
          <AlertDialogDescription>{copy.description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep editing</AlertDialogCancel>
          {onSave && <AlertDialogAction onClick={onSave}>Save and close</AlertDialogAction>}
          <AlertDialogAction onClick={onDiscard} className="bg-destructive text-white hover:bg-destructive/90">
            Close without saving
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function DeleteDialog({ open, onOpenChange, onDelete, pending }: ConfirmProps & { onDelete: () => void; pending: boolean }) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this post?</AlertDialogTitle>
          <AlertDialogDescription>
            It&apos;s removed from Social Stream and the website. Anything already posted to social channels stays there — remove those on each platform.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep post</AlertDialogCancel>
          <AlertDialogAction
            disabled={pending}
            onClick={(e) => {
              e.preventDefault();
              onDelete();
            }}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            {pending ? "Deleting" : "Delete post"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
