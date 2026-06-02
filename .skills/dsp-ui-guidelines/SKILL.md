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
* Each page **must** be isolated and have its own configuration file (`*config.tsx`).
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

---

## 2. State & Data Layer

* **Global State Management**: Use **Zustand** with storage persistence for light/dark theme states, auth state (`authStore.ts`), and localized application-wide parameters.
* **Server State**: Use **React Query** (`@tanstack/react-query`) for handling remote API resources.
* **Mock Integrations**: As there is no backend API, simulate realistic delays for CRUD/auth states using `setTimeout` to emulate network latency and provide a premium user experience with active loaders.

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
