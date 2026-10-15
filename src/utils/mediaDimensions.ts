// Read the natural width/height (and, for video, the duration in seconds) of
// an image or video file in the browser, before upload.
export const getMediaDimensions = (
  file: File,
): Promise<{ w: number; h: number; duration: number }> =>
  new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    if (file.type.startsWith("video")) {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => {
        URL.revokeObjectURL(url);
        resolve({ w: video.videoWidth, h: video.videoHeight, duration: Math.round(video.duration) || 0 });
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
