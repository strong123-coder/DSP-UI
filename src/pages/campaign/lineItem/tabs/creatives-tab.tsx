import React, { useState } from "react";
import { useFormContext } from "react-hook-form";
import { toast } from "sonner";
import { Check, FileImage, Loader2, Tv, Upload, Video } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useCreatives, useCreateCreative } from "@/query/useCreative";
import { mediaService } from "@/services/media";
import { getMediaDimensions } from "@/utils/mediaDimensions";
import type { Creative } from "@/services/creative";
import type { LineItemFormValues } from "@/utils/schemas/lineItem";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const IMAGE_EXT = ["png", "jpg", "jpeg", "gif", "svg"];
const VIDEO_EXT = ["mp4"];

// Pick creatives from the advertiser's library (only the line item's format),
// or add new ones: uploads and VAST tags go into the library and are attached.
const CreativesTab: React.FC<{ advertiserId: string; format: "banner" | "video" }> = ({ advertiserId, format }) => {
  const { watch, setValue } = useFormContext<LineItemFormValues>();
  const isVideo = format === "video";
  const type = isVideo ? "video" : "image";
  const { data, isLoading } = useCreatives(advertiserId, type);
  const createMut = useCreateCreative();
  const library: Creative[] = data?.data?.data ?? [];

  const selected = watch("creatives") || [];
  const selectedIds = new Set(selected.map((c) => c.creativeId));
  const setSelected = (ids: string[]) =>
    setValue("creatives", ids.map((creativeId) => ({ creativeId })), { shouldDirty: true, shouldValidate: true });
  const toggle = (id: string) =>
    setSelected(selectedIds.has(id) ? [...selectedIds].filter((x) => x !== id) : [...selectedIds, id]);

  const [uploading, setUploading] = useState(false);
  const [vastTag, setVastTag] = useState("");
  const [vastDuration, setVastDuration] = useState("");

  const attach = (ids: string[]) => setSelected([...new Set([...selectedIds, ...ids])]);

  const onFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).slice(0, 5);
    e.target.value = "";
    const valid = files.filter((f) => {
      const ext = f.name.split(".").pop()?.toLowerCase() || "";
      if (f.size > MAX_FILE_SIZE) {
        toast.error(`${f.name}: larger than 10 MB.`);
        return false;
      }
      if (!(isVideo ? VIDEO_EXT : IMAGE_EXT).includes(ext)) {
        toast.error(`${f.name}: a ${format} line item takes ${isVideo ? "MP4 video" : "PNG, JPG, GIF or SVG images"}.`);
        return false;
      }
      return true;
    });
    if (!valid.length) return;

    setUploading(true);
    const created: string[] = [];
    for (const file of valid) {
      try {
        const { w, h, duration } = await getMediaDimensions(file);
        const fd = new FormData();
        fd.append("name", file.name);
        fd.append("type", "campaign");
        fd.append("image", file);
        const up: any = await mediaService.addMedia(fd);
        const media = up?.data?.data || up?.data || up;
        const res: any = await createMut.mutateAsync({
          advertiserId,
          mediaId: media._id,
          name: file.name,
          type,
          w: w || undefined,
          h: h || undefined,
          ...(isVideo ? { duration: duration || undefined, mime: media.fileType || file.type } : {}),
        });
        created.push(res?.data?.data?._id);
      } catch {
        toast.error(`${file.name}: upload failed.`);
      }
    }
    setUploading(false);
    if (created.length) {
      attach(created.filter(Boolean));
      toast.success(`${created.length} creative${created.length > 1 ? "s" : ""} added and attached`);
    }
  };

  const addVast = async () => {
    const tag = vastTag.trim();
    if (!/^https?:\/\//i.test(tag)) {
      toast.error("Enter a VAST tag URL starting with http:// or https://");
      return;
    }
    const res: any = await createMut.mutateAsync({
      advertiserId,
      type: "video",
      vastTag: tag,
      name: "VAST tag",
      duration: Number(vastDuration) || undefined,
      w: 1920,
      h: 1080,
    });
    const id = res?.data?.data?._id;
    if (id) attach([id]);
    setVastTag("");
    setVastDuration("");
    toast.success("VAST tag added and attached");
  };

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            {isVideo ? <Tv className="w-4 h-4 text-primary" /> : <FileImage className="w-4 h-4 text-primary" />}
            Creatives for this line item
          </CardTitle>
          <CardDescription>
            From this advertiser's library. A {format} line item takes {isVideo ? "video creatives (MP4 or VAST tag)" : "image creatives"}.
            The bid engine picks the best size match for each impression.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{selected.length} of {library.length} attached</span>
            {library.length > 0 && (
              <span className="flex gap-3">
                <button type="button" className="hover:text-foreground" onClick={() => setSelected(library.map((c) => c._id))}>Attach all</button>
                <button type="button" className="hover:text-foreground" onClick={() => setSelected([])}>Clear</button>
              </span>
            )}
          </div>
          {isLoading ? (
            <div className="py-8 text-center text-sm text-muted-foreground">Loading creatives…</div>
          ) : library.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground border border-dashed border-border rounded-xl">
              No {isVideo ? "video" : "image"} creatives for this advertiser yet. Upload one below.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
              {library.map((c) => {
                const on = selectedIds.has(c._id);
                return (
                  <button
                    key={c._id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggle(c._id)}
                    className={`relative text-left rounded-xl border-2 overflow-hidden transition-colors focus-visible:outline-2 focus-visible:outline-primary ${
                      on ? "border-primary" : "border-border hover:border-ring/40"
                    }`}
                  >
                    <div className="aspect-video bg-muted flex items-center justify-center overflow-hidden">
                      {c.type === "image" && c.link ? (
                        <img src={c.link} alt="" className="max-w-full max-h-full object-contain" loading="lazy" />
                      ) : (
                        <Video className="w-6 h-6 text-muted-foreground" />
                      )}
                    </div>
                    <div className="p-2">
                      <div className="text-xs font-medium truncate" title={c.name || c.vastTag || ""}>{c.name || (c.vastTag ? "VAST tag" : "Creative")}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {c.w && c.h ? `${c.w}×${c.h}` : "size unknown"}
                        {c.duration ? ` · ${c.duration}s` : ""}
                        {c.vastTag ? " · VAST" : ""}
                      </div>
                    </div>
                    {on && (
                      <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add new</CardTitle>
          <CardDescription>New creatives go into the advertiser's library and are attached to this line item.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <label
            htmlFor="creative-upload"
            className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border rounded-xl p-6 cursor-pointer hover:bg-muted/20 transition-colors"
          >
            {uploading ? <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /> : <Upload className="w-5 h-5 text-muted-foreground" />}
            <span className="text-sm font-medium">{uploading ? "Uploading…" : isVideo ? "Upload MP4 videos" : "Upload images"}</span>
            <span className="text-xs text-muted-foreground">Up to 5 files, 10 MB each</span>
            <input id="creative-upload" type="file" multiple className="sr-only" disabled={uploading}
              accept={isVideo ? "video/mp4" : "image/png,image/jpeg,image/gif,image/svg+xml"} onChange={onFiles} />
          </label>

          {isVideo && (
            <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_120px_auto] gap-3 items-end">
              <div className="space-y-1.5 min-w-0">
                <Label htmlFor="vastTag">VAST tag URL</Label>
                <Input id="vastTag" placeholder="https://ads.example.com/vast.xml" value={vastTag} onChange={(e) => setVastTag(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="vastDuration">Duration (s)</Label>
                <Input id="vastDuration" type="number" min="1" placeholder="15" value={vastDuration} onChange={(e) => setVastDuration(e.target.value)} />
              </div>
              <Button type="button" variant="outline" onClick={addVast} disabled={createMut.isPending}>Add VAST tag</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CreativesTab;
