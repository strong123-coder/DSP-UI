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
import { Loader2, Info } from "lucide-react";

interface UpdatePopupModalProps {
  isOpen: boolean;
  title: React.ReactNode;
  description: React.ReactNode;
  cancelButtonAction: () => void;
  updateButtonAction: () => void;
  isUpdating?: boolean;
}

export const UpdatePopupModal: React.FC<UpdatePopupModalProps> = ({
  isOpen,
  title,
  description,
  cancelButtonAction,
  updateButtonAction,
  isUpdating = false,
}) => {
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isUpdating) {
          cancelButtonAction();
        }
      }}
    >
      <DialogContent
        className="sm:max-w-[420px]"
        showCloseButton={!isUpdating}
        onPointerDownOutside={(e) => {
          if (isUpdating) {
            e.preventDefault();
          }
        }}
        onEscapeKeyDown={(e) => {
          if (isUpdating) {
            e.preventDefault();
          }
        }}
      >
        <div className="flex gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Info className="h-5 w-5" />
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
              if (isUpdating) return;
              cancelButtonAction();
            }}
            disabled={isUpdating}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => {
              if (isUpdating) return;
              updateButtonAction();
            }}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UpdatePopupModal;
