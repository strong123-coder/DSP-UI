import { Loader2 } from "lucide-react";

export default function LoadingFallback() {
  return (
    <div className="flex justify-center items-center h-full w-full">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
}
