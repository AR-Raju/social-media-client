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
import { Bookmark } from "lucide-react";

interface SaveConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  itemType: "post" | "event" | "listing";
}

export function SaveConfirmationModal({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  itemType,
}: SaveConfirmationModalProps) {
  const getItemTypeText = () => {
    switch (itemType) {
      case "post":
        return "post";
      case "event":
        return "event";
      case "listing":
        return "marketplace item";
      default:
        return "item";
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <Bookmark className="h-5 w-5 text-primary" />
            <AlertDialogTitle>Save {getItemTypeText()}?</AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            {description ||
              `Do you want to save "${title}" to your saved items? You can access it later from your saved items page.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            <Bookmark className="mr-2 h-4 w-4" />
            Save Item
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
