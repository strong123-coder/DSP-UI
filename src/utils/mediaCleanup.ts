import { useAppStore } from "@/store";

/**
 * Sends a keepalive fetch request to delete media files from the server.
 * This is designed for tab/window unload events where standard async axios calls would fail.
 * 
 * @param ids Array of media IDs to delete
 */
export const deleteMediaOnUnload = (ids: string[]) => {
  if (!ids || ids.length === 0) return;

  const token = useAppStore.getState().token;
  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/";
  const url = `${baseUrl}api/v1/media/delete-many`;

  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ ids }),
    keepalive: true, // Tells browser to keep request alive after document is unloaded
  }).catch((err) => console.error("Unload media cleanup failed:", err));
};
