import React, { useState } from "react";
import { useFormContext, useFieldArray, useWatch } from "react-hook-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Trash2, Loader2, FileImage, ExternalLink } from "lucide-react";
import { useAddMedia, useDeleteMedia } from "@/query/useMedia";
import type { AddCampaignFormValues } from "@/utils/schemas/campaign";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

// Helper to extract clean filename from URL
const getFilenameFromUrl = (url: string) => {
  if (!url) return "Creative Asset";
  try {
    const decoded = decodeURIComponent(url);
    const path = decoded.split("?")[0];
    const parts = path.split("/");
    const lastPart = parts[parts.length - 1];
    const nameParts = lastPart.split("_");
    if (nameParts.length > 1) {
      return nameParts.slice(1).join("_");
    }
    return lastPart;
  } catch {
    return "Creative Asset";
  }
};

interface MediaCreativeCardProps {
  idx: number;
  actualId: string;
  link: string;
  type: string;
  filename: string;
  newlyUploadedMediaIds: string[];
  setNewlyUploadedMediaIds: React.Dispatch<React.SetStateAction<string[]>>;
  setDeletedMediaIds?: React.Dispatch<React.SetStateAction<string[]>>;
  removeMedia: (index?: number | number[]) => void;
  getValues: any;
}

const MediaCreativeCard: React.FC<MediaCreativeCardProps> = ({
  idx,
  actualId,
  link,
  type,
  filename,
  newlyUploadedMediaIds,
  setNewlyUploadedMediaIds,
  setDeletedMediaIds,
  removeMedia,
  getValues,
}) => {
  const { mutate: deleteMediaMutation, isPending: isDeleting } = useDeleteMedia();

  const handleDelete = () => {
    if (!actualId) {
      removeMedia(idx);
      return;
    }

    if (newlyUploadedMediaIds.includes(actualId)) {
      // If it was newly uploaded in this session, delete it immediately from server
      deleteMediaMutation(actualId, {
        onSuccess: (response: any) => {
          const deletedId = response?.data?.data?.id || response?.data?.id || response?.id || actualId;
          const currentMedia = getValues("media") || [];
          const currentIdx = currentMedia.findIndex((m: any) => m?.id === deletedId);
          if (currentIdx !== -1) {
            removeMedia(currentIdx);
          }
          setNewlyUploadedMediaIds((prev) => prev.filter((id) => id !== deletedId));
        },
      });
    } else {
      // It's an original media from the database.
      // Defer API deletion: queue it in deletedMediaIds and remove from form UI state.
      if (setDeletedMediaIds) {
        setDeletedMediaIds((prev) => [...prev, actualId]);
      }
      removeMedia(idx);
    }
  };

  return (
    <div className="flex flex-col border border-border bg-muted/10 rounded-xl group relative overflow-hidden transition-all hover:border-primary/30">
      {/* Media Preview container */}
      <div className="aspect-video w-full bg-background border-b border-border relative flex items-center justify-center overflow-hidden">
        {type === "video" ? (
          <video
            src={link || undefined}
            className="w-full h-full object-cover"
            controls={false}
            muted
          />
        ) : (
          <img
            src={link || undefined}
            alt={filename}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLElement).style.display = "none";
            }}
          />
        )}
        <Badge className="absolute top-2 right-2 capitalize font-medium text-[10px]">
          {type}
        </Badge>
      </div>

      {/* Info & Action Row */}
      <div className="p-3 flex items-start gap-2 justify-between">
        <div className="flex-1 min-w-0">
          <p
            className="text-xs font-semibold text-foreground truncate"
            title={filename}
          >
            {filename}
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {link && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={() => window.open(link, "_blank")}
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:bg-destructive/10"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Trash2 className="w-3.5 h-3.5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

interface StepMediaCreativesProps {
  setDeletedMediaIds?: React.Dispatch<React.SetStateAction<string[]>>;
  newlyUploadedMediaIds?: string[];
  setNewlyUploadedMediaIds?: React.Dispatch<React.SetStateAction<string[]>>;
}

const StepMediaCreatives: React.FC<StepMediaCreativesProps> = ({
  setDeletedMediaIds,
  newlyUploadedMediaIds: newlyUploadedMediaIdsProp,
  setNewlyUploadedMediaIds: setNewlyUploadedMediaIdsProp,
}) => {
  const { control, getValues } = useFormContext<AddCampaignFormValues>();

  const [localNewlyUploadedMediaIds, setLocalNewlyUploadedMediaIds] = useState<string[]>([]);
  const newlyUploadedMediaIds = newlyUploadedMediaIdsProp ?? localNewlyUploadedMediaIds;
  const setNewlyUploadedMediaIds = setNewlyUploadedMediaIdsProp ?? setLocalNewlyUploadedMediaIds;

  const {
    fields,
    append: appendMedia,
    remove: removeMedia,
  } = useFieldArray({
    control,
    name: "media",
  });

  // Watch the media form values reactively to get correct data properties
  const mediaValues =
    useWatch({
      control,
      name: "media",
    }) || [];

  const { mutate: addMediaMutation, isPending: addMediaPending } =
    useAddMedia();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (Max 10MB)
    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      toast.error("File size exceeds the 10MB limit.");
      e.target.value = "";
      return;
    }

    // Validate file extension
    const ALLOWED_EXTENSIONS = ["png", "jpg", "jpeg", "gif", "svg", "mp4"];
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (!extension || !ALLOWED_EXTENSIONS.includes(extension)) {
      toast.error(
        "Unsupported format. Please upload PNG, JPG, JPEG, GIF, SVG, or MP4."
      );
      e.target.value = "";
      return;
    }

    const formData = new FormData();
    formData.append("name", file.name);
    formData.append("type", "campaign");
    formData.append("image", file);

    // Reset the input value so selecting the same file again triggers change event
    e.target.value = "";

    addMediaMutation(formData, {
      onSuccess: (response: any) => {
        const mediaData = response?.data?.data || response?.data || response;
        if (mediaData) {
          const mediaId = mediaData._id || mediaData.id || `creative_${Date.now()}`;
          setNewlyUploadedMediaIds((prev) => [...prev, mediaId]);
          appendMedia({
            id: mediaId,
            link: mediaData.link1 || mediaData.link,
            type: mediaData.fileType?.includes("video") ? "video" : "image",
          });
        }
      },
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      <Card className="border border-border/50 rounded-xl bg-card shadow-none">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileImage className="w-5 h-5 text-primary" /> Campaign Media
            Creatives
          </CardTitle>
          <CardDescription>
            Upload and manage the creative image or video assets for your
            campaign.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* File Selection Box (Upload Area) */}
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-8 hover:bg-muted/10 transition-colors relative">
            <input
              type="file"
              id="campaign-asset-upload"
              accept="image/*,video/*"
              className="hidden"
              onChange={handleFileUpload}
              disabled={addMediaPending}
            />
            <label
              htmlFor="campaign-asset-upload"
              className="flex flex-col items-center cursor-pointer space-y-2 group w-full py-4 text-center"
            >
              {addMediaPending ? (
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
              ) : (
                <Upload className="w-10 h-10 text-muted-foreground group-hover:text-primary transition-colors" />
              )}
              <span className="text-sm font-semibold text-foreground">
                {addMediaPending
                  ? "Uploading Asset..."
                  : "Click to select or drag creative files here"}
              </span>
              <span className="text-xs text-muted-foreground">
                Supports PNG, JPG, JPEG, GIF, SVG, MP4 (Max 10MB)
              </span>
            </label>
          </div>

          {/* List of Selected/Uploaded Medias */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Selected Creatives ({fields.length})
            </h4>

            {fields.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border border-dashed border-border rounded-xl">
                No creatives selected yet. Please upload at least one image or
                video asset.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {fields.map((field, idx) => {
                  const val = mediaValues[idx] || {};
                  const actualId = val.id || "";
                  const link = val.link || "";
                  const type = val.type || "image";
                  const filename = getFilenameFromUrl(link);

                  return (
                    <MediaCreativeCard
                      key={field.id}
                      idx={idx}
                      actualId={actualId}
                      link={link}
                      type={type}
                      filename={filename}
                      newlyUploadedMediaIds={newlyUploadedMediaIds}
                      setNewlyUploadedMediaIds={setNewlyUploadedMediaIds}
                      setDeletedMediaIds={setDeletedMediaIds}
                      removeMedia={removeMedia}
                      getValues={getValues}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StepMediaCreatives;
