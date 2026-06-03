---
name: dsp-ui-guidelines
description: Core architectural, coding, and design standards for the DSP-UI admin console workspace.
---

# DSP-UI Development Guidelines & Architecture

This document serves as the mandatory ruleset and design guideline for the DSP-UI workspace. Any agent modifying or extending this codebase must adhere strictly to these principles to maintain architectural and aesthetic integrity.

---

## 1. Directory & Routing Architecture

### Service-Query-View Pattern
We follow the **Vanshavali** patterns for page and route structures:
* Each page/feature **must** be isolated and have its own configuration file (`*config.tsx`).
* **Route Configuration**: Each page folder (e.g., `src/pages/dashboard`) must contain:
  1. `[page-name].tsx` - The primary view page.
  2. `[page-name]-config.tsx` - The routing configuration block using lazy imports.
* **Lazy Loading & Suspense**: Use `React.lazy()` with a `<Suspense>` wrapper and `<LoadingFallback />` for modular page chunk rendering.

#### Page Config Example:
```tsx
import React, { Suspense } from "react";
import LoadingFallback from "@/components/ui/loading-fallback";

const DashboardPage = React.lazy(() => import("./dashboard"));

export const dashboardRoute = {
  path: "dashboard",
  element: (
    <Suspense fallback={<LoadingFallback />}>
      <DashboardPage />
    </Suspense>
  )
};
```

### Nested Routing & Children Layouts (e.g., Campaign Structure)
For features containing multiple sub-views (e.g., `campaign`), organize sub-pages under nested children:
* **Layout/Router Boundary**: Create a parent config (e.g. `campaign-config.tsx`) mapping the parent path (e.g. `path: "/campaign"`). It must render `<Outlet />` (from `react-router-dom`) as its element or parent boundary.
* **Nested Children Routes**: Declare nested route configurations (e.g. `CampaignListConfig`, `CampaignAddConfig`) in the parent config's `children` array.
* **Default Redirect/Index Route**: Always define an index redirect route using `<Navigate to="..." replace />` to point to the primary sub-page on parent path matches:
  ```typescript
  const CampaignConfig = {
    path: "/campaign",
    children: [
      {
        index: true,
        element: <Navigate to="/campaign/list" replace />,
      },
      CampaignListConfig,
      CampaignAddConfig,
    ],
  };
  ```

---

## 2. State & Data Layer

* **Global State Management (Zustand)**: Implement Zustand store files using the decoupled slice-based combined store setup under `src/store/`:
  - Declare state slices inside `src/store/slices/` (e.g., `authSlice.ts`), containing state properties and creators.
  - Combine slices in `src/store/index.ts` to export the global `useAppStore` hook.
  - **Hydration & Storage Safety**: Track store persistence status using `hasHydrated` status flags, configuring rehydration completion using `onRehydrateStorage` callbacks to avoid auth redirect flicker. Limit LocalStorage serialization strictly to data fields (e.g., `token`, `user`) using `partialize`.
* **Server State (React Query)**: Isolate remote API mutations and query hooks under `src/query/` (e.g., `useUserManagement.ts`):
  - Do not handle state mutations or toast alerts directly inside UI components. Let query hook `onSuccess` and `onError` callbacks update Zustand stores and issue Sonner alerts, keeping form submission handlers minimal.
  - Always destructure hook return properties when using them inside components:
    ```typescript
    const { mutate: loginMutation, isPending: loginPending } = useLogin();
    ```
* **API Services**: All network calls must be consolidated under `src/services/` (e.g. `userManagement-service.ts`) using the `apiClient()` helper. Do not write inline API calls or mock timeouts.
* **Zod Form Schema & Payload Type-safety**: Centralize validation schemas under `src/utils/schemas/` (e.g., `auth.ts`):
  - Always define strict Zod validation schemas for form inputs.
  - Export types inferred from schemas using `InferSchemaType` utility:
    ```typescript
    export type LoginFormValues = InferSchemaType<typeof loginSchema>;
    ```
  - Use these inferred type signatures across Hook Forms, React Query mutation functions, and API payload arguments to enforce compilation-level type-safety.

---

## 3. Styling & Theme System (Tailwind CSS v4 & Shadcn/ui)

We use the customized **Shadcn/ui Radix-Maia style (`radix-maia`)** built on Tailwind CSS v4.

### Verbatim Theme Variables
All theme constraints are derived strictly from `src/index.css`. **Do NOT modify these unless explicitly instructed**:
* **Sharp Corners**: `--radius: 0` is set intentionally. Do not add arbitrary `rounded-xl`, `rounded-2xl`, or default-rounded classes that break this theme aesthetic.
* **Tailwind v4 syntax**: Reference variable values using the new Tailwind v4 bracketless style: `rounded-(--radius)`.
* **Background Contrast**: 
  - Light-mode utilizes a soft Mauve background: `--background: oklch(0.985 0.003 325.6)`
  - Cards leverage a solid white background: `--card: oklch(1 0 0)`
  - This allows dashboard items to "float" dynamically over the canvas.

---

## 4. UI Layout Stability Rules

* **Scrollbar Position Jitter Fix**: Keep the scrollbar persistent on the main container to avoid width shifts when navigating between short and long pages. Always keep `overflow-y-scroll` on the main workspace wrapper.
* **Header Height Stability**: The top header (`<header className="h-14 shrink-0 ...">`) must always contain **`shrink-0`** to prevent the flex layout from squeezing the header size when vertical dashboard content grows.
