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
import { Upload, Trash2, Loader2, FileImage, ExternalLink, Tv, Plus, Link2 } from "lucide-react";
import { useDeleteMedia } from "@/query/useMedia";
import { mediaService } from "@/services/media";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Max number of files a user can upload in a single selection.
const MAX_FILES_PER_UPLOAD = 5;
import type { AddCampaignFormValues } from "@/utils/schemas/campaign";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

// Helper to read the natural width/height (and, for video, the duration in
// seconds) of an image or video file (client-side).
const getMediaDimensions = (
  file: File,
): Promise<{ w: number; h: number; duration: number }> => {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);

    if (file.type.startsWith("video")) {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => {
        URL.revokeObjectURL(url);
        resolve({
          w: video.videoWidth,
          h: video.videoHeight,
          duration: Math.round(video.duration) || 0,
        });
      };
      video.onerror = () => {
        URL.revokeObjectURL(url);
        resolve({ w: 0, h: 0, duration: 0 });
      };
      video.src = url;
    } else {
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve({ w: img.naturalWidth, h: img.naturalHeight, duration: 0 });
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve({ w: 0, h: 0, duration: 0 });
      };
      img.src = url;
    }
  });
};

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
  w?: number;
  h?: number;
  duration?: number;
  vastTag?: string;
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
  w,
  h,
  duration,
  vastTag,
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
        {vastTag ? (
          // 3rd-party VAST tag — no local media to preview.
          <div className="flex flex-col items-center gap-1 text-muted-foreground px-3 text-center">
            <Tv className="w-8 h-8" />
            <span className="text-[10px] font-semibold uppercase tracking-wider">VAST Tag</span>
          </div>
        ) : type === "video" ? (
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
            title={vastTag || filename}
          >
            {vastTag || filename}
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {w && h ? `${w} × ${h} px` : ""}
            {duration ? `${w && h ? " · " : ""}${duration}s` : ""}
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

  // CTV is a distinct campaign TYPE (chosen on the platform-type step). A CTV
  // campaign takes video creatives only (upload MP4 / VAST tag); a display
  // campaign (mobile/web) takes images only. They never mix.
  const campaignType = useWatch({ control, name: "type" }) as string | undefined;
  const isCtv = campaignType === "ctv";

  // Local inputs for adding a 3rd-party VAST tag creative.
  const [vastTag, setVastTag] = useState("");
  const [vastDuration, setVastDuration] = useState("");

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

  const [isUploading, setIsUploading] = useState(false);

  // Upload a single file and return the data needed to append it to the form.
  const uploadOne = async (file: File) => {
    const { w, h, duration } = await getMediaDimensions(file);
    const formData = new FormData();
    formData.append("name", file.name);
    formData.append("type", "campaign");
    formData.append("image", file);

    const response: any = await mediaService.addMedia(formData);
    const mediaData = response?.data?.data || response?.data || response;
    if (!mediaData) throw new Error("Empty upload response");

    const isVideo = mediaData.fileType?.includes("video") || file.type.startsWith("video");
    return {
      id: mediaData._id || mediaData.id || `creative_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      link: mediaData.link1 || mediaData.link,
      type: isVideo ? "video" : "image",
      w,
      h,
      ...(isVideo ? { duration, mime: mediaData.fileType || file.type } : {}),
    };
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    // Reset early so re-selecting the same file(s) still fires onChange.
    e.target.value = "";
    if (selected.length === 0) return;

    // Cap the number of files per upload.
    let files = selected;
    if (files.length > MAX_FILES_PER_UPLOAD) {
      toast.error(
        `You can upload up to ${MAX_FILES_PER_UPLOAD} files at once. Using the first ${MAX_FILES_PER_UPLOAD}.`
      );
      files = files.slice(0, MAX_FILES_PER_UPLOAD);
    }

    // Validate each file (size + extension); collect the valid ones. A CTV
    // campaign accepts video only; a display campaign accepts images only.
    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    const IMAGE_EXTENSIONS = ["png", "jpg", "jpeg", "gif", "svg"];
    const VIDEO_EXTENSIONS = ["mp4"];
    const valid: File[] = [];
    for (const file of files) {
      const extension = file.name.split(".").pop()?.toLowerCase();
      const isVideoFile =
        file.type.startsWith("video") || (!!extension && VIDEO_EXTENSIONS.includes(extension));
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name}: exceeds the 10MB limit.`);
        continue;
      }
      if (isCtv && !isVideoFile) {
        toast.error(`${file.name}: a CTV campaign takes video creatives only.`);
        continue;
      }
      if (!isCtv && isVideoFile) {
        toast.error(`${file.name}: set the campaign type to CTV to upload videos.`);
        continue;
      }
      const allowed = isCtv ? VIDEO_EXTENSIONS : IMAGE_EXTENSIONS;
      if (!extension || !allowed.includes(extension)) {
        toast.error(`${file.name}: unsupported format.`);
        continue;
      }
      valid.push(file);
    }
    if (valid.length === 0) return;

    // Upload all valid files in parallel.
    setIsUploading(true);
    const results = await Promise.allSettled(valid.map((f) => uploadOne(f)));
    setIsUploading(false);

    let uploaded = 0;
    results.forEach((res) => {
      if (res.status === "fulfilled") {
        const m = res.value;
        setNewlyUploadedMediaIds((prev) => [...prev, m.id]);
        appendMedia(m);
        uploaded += 1;
      }
    });

    if (uploaded > 0) {
      toast.success(`${uploaded} creative${uploaded > 1 ? "s" : ""} uploaded`);
    }
    const failed = valid.length - uploaded;
    if (failed > 0) {
      toast.error(`${failed} upload${failed > 1 ? "s" : ""} failed`);
    }
  };

  // Add a 3rd-party VAST tag as a video creative (no upload).
  const addVastTag = () => {
    const tag = vastTag.trim();
    if (!tag) {
      toast.error("Enter a VAST tag URL.");
      return;
    }
    if (!/^https?:\/\//i.test(tag)) {
      toast.error("VAST tag must be a valid http(s) URL.");
      return;
    }
    appendMedia({
      id: `vast_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      type: "video",
      vastTag: tag,
      duration: Number(vastDuration) || undefined,
      // CTV default frame; the player uses the VAST response's actual dimensions.
      w: 1920,
      h: 1080,
    } as any);
    setVastTag("");
    setVastDuration("");
    toast.success("VAST tag creative added");
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
          {/* Mode banner — driven by the campaign TYPE (chosen earlier). CTV ⇒
              video creatives only; display ⇒ image creatives only. */}
          <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-muted/20 p-4">
            <span className="mt-0.5 p-2 rounded-lg bg-primary/10 text-primary">
              {isCtv ? <Tv className="w-4 h-4" /> : <FileImage className="w-4 h-4" />}
            </span>
            <div>
              <p className="text-sm font-semibold">
                {isCtv ? "CTV / Video campaign" : "Display campaign"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 max-w-md">
                {isCtv
                  ? "This is a CTV campaign — add video creatives only (upload an MP4 or paste a VAST tag). To run display instead, change the platform type."
                  : "Add image creatives (banner). To run connected-TV / in-app video, set the platform type to CTV."}
              </p>
            </div>
          </div>
          {/* File Selection Box (Upload Area) */}
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-8 hover:bg-muted/10 transition-colors relative">
            <input
              type="file"
              id="campaign-asset-upload"
              accept={isCtv ? "video/mp4" : "image/*"}
              multiple
              className="hidden"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
            <label
              htmlFor="campaign-asset-upload"
              className="flex flex-col items-center cursor-pointer space-y-2 group w-full py-4 text-center"
            >
              {isUploading ? (
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
              ) : (
                <Upload className="w-10 h-10 text-muted-foreground group-hover:text-primary transition-colors" />
              )}
              <span className="text-sm font-semibold text-foreground">
                {isUploading
                  ? "Uploading Assets..."
                  : "Click to select or drag creative files here"}
              </span>
              <span className="text-xs text-muted-foreground">
                {isCtv ? "Supports MP4 video (Max 10MB)" : "Supports PNG, JPG, JPEG, GIF, SVG (Max 10MB)"} ·
                up to {MAX_FILES_PER_UPLOAD} files at once
              </span>
            </label>
          </div>

          {/* VAST tag adder — only when CTV is enabled */}
          {isCtv && (
            <div className="rounded-xl border border-border/60 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Link2 className="w-4 h-4 text-primary" />
                <p className="text-sm font-semibold">Add a VAST tag (3rd-party video)</p>
              </div>
              <p className="text-xs text-muted-foreground">
                Paste a VAST ad-tag URL if the advertiser's ad server serves the video. The
                engine wraps it and injects our impression / click / complete tracking.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
                <div className="flex-1 space-y-1">
                  <Label htmlFor="vast-tag" className="text-xs">VAST tag URL</Label>
                  <Input
                    id="vast-tag"
                    placeholder="https://ad-server.example/vast?..."
                    value={vastTag}
                    onChange={(e) => setVastTag(e.target.value)}
                  />
                </div>
                <div className="w-full sm:w-32 space-y-1">
                  <Label htmlFor="vast-duration" className="text-xs">Duration (s)</Label>
                  <Input
                    id="vast-duration"
                    type="number"
                    min={1}
                    placeholder="15"
                    value={vastDuration}
                    onChange={(e) => setVastDuration(e.target.value)}
                  />
                </div>
                <Button type="button" onClick={addVastTag} className="gap-1.5 shrink-0">
                  <Plus className="w-4 h-4" /> Add tag
                </Button>
              </div>
            </div>
          )}

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
                      w={val.w}
                      h={val.h}
                      duration={(val as any).duration}
                      vastTag={(val as any).vastTag}
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
