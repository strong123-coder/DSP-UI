import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle } from "lucide-react";

interface DeletePopupModalProps {
  isOpen: boolean;
  title: React.ReactNode;
  description: React.ReactNode;
  cancelButtonAction: () => void;
  deleteButtonAction: () => void;
  isDeleting?: boolean;
}

export const DeletePopupModal: React.FC<DeletePopupModalProps> = ({
  isOpen,
  title,
  description,
  cancelButtonAction,
  deleteButtonAction,
  isDeleting = false,
}) => {
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isDeleting) {
          cancelButtonAction();
        }
      }}
    >
      <DialogContent
        className="sm:max-w-[420px]"
        showCloseButton={!isDeleting}
        onPointerDownOutside={(e) => {
          if (isDeleting) {
            e.preventDefault();
          }
        }}
        onEscapeKeyDown={(e) => {
          if (isDeleting) {
            e.preventDefault();
          }
        }}
      >
        <div className="flex gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="flex-1 space-y-2">
            <DialogHeader className="text-left gap-0">
              <DialogTitle className="text-base font-semibold leading-6">
                {title}
              </DialogTitle>
            </DialogHeader>
            <DialogDescription className="text-sm text-muted-foreground wrap-break-word leading-normal">
              {description}
            </DialogDescription>
          </div>
        </div>
        <DialogFooter className="mt-4 sm:flex-row sm:justify-end gap-2 flex-col-reverse">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (isDeleting) return;
              cancelButtonAction();
            }}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => {
              if (isDeleting) return;
              deleteButtonAction();
            }}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeletePopupModal;
