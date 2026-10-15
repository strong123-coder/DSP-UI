import React, { Suspense } from "react";
import LoadingFallback from "@/components/ui/loading-fallback";

const PresetList = React.lazy(() => import("./preset-list"));

const PresetConfig = {
  path: "/preset",
  title: "Presets",
  children: [
    {
      index: true,
      title: "Presets",
      element: (
        <Suspense fallback={<LoadingFallback />}>
          <PresetList />
        </Suspense>
      ),
    },
  ],
};

export default PresetConfig;
