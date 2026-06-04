---
name: dsp-ui-guidelines
description: Core architectural, coding, and design standards for the DSP-UI admin console workspace.
---

# DSP-UI Development Guidelines & Architecture

This document serves as the mandatory ruleset and design guideline for the DSP-UI workspace. Any agent modifying or extending this codebase must adhere strictly to these principles to maintain architectural and aesthetic integrity.

---

## Tech Stack (Quick Reference)

| Layer | Technology |
|-------|-----------|
| Framework | Vite + React 19 + TypeScript |
| Routing | React Router DOM v7 |
| Global State | Zustand (slice-based + `persist`) |
| Server State | TanStack React Query v5 |
| Forms | React Hook Form + Zod |
| UI Library | Shadcn/ui (radix-maia) + Tailwind CSS v4 |
| Notifications | Sonner |
| HTTP | Axios via `apiClient()` named-endpoint wrapper |

---

## 1. API Layer — `src/api/`

Three files form the entire HTTP infrastructure:

- **`config.ts`** — `ApiEndpoint[]` registry mapping names → paths
- **`instance.ts`** — Axios instance (base URL from `VITE_API_BASE_URL`, auth interceptors)
- **`apiClient.ts`** — Typed method factory: `.get()`, `.post()`, `.patch()`, `.put()`, `.del()`

### Adding an Endpoint
```typescript
// src/api/config.ts
{ name: "getUserList", path: "/api/v1/user/list" },
{ name: "deleteUser", path: "/api/v1/user/{id}", hasPathParams: true },
```

### Calling an Endpoint
```typescript
apiClient().get("getUserList", { page: 1, limit: 10 });
apiClient().del("deleteUser", undefined, undefined, { id: "abc" });
```
**Never** write raw `axios` calls outside of services.

---

## 2. Directory & Routing Architecture

### Service-Query-View Pattern
Each page/feature must be isolated with its own config file (`*-config.tsx`).

### Leaf Page Config (Lazy Loading)
```tsx
// src/pages/dashboard/dashboard-config.tsx
import React, { Suspense } from "react";
import LoadingFallback from "@/components/ui/loading-fallback";

const DashboardPage = React.lazy(() => import("./dashboard"));

export const dashboardRoute = {
  path: "dashboard",
  element: (
    <Suspense fallback={<LoadingFallback />}>
      <DashboardPage />
    </Suspense>
  ),
};
```

### Nested Feature Routing (e.g. Campaign)
Parent config handles routing boundary with `children` array + index redirect:
```tsx
// src/pages/campaign/campaign-config.tsx
import { Navigate } from "react-router";
const CampaignConfig = {
  path: "/campaign",
  children: [
    { index: true, element: <Navigate to="/campaign/list" replace /> },
    CampaignListConfig,
    CampaignAddConfig,
  ],
};
```
The parent route must **NOT** have its own `element` — children handle rendering.

### Root Router (`src/routes/router.tsx`)
All top-level features are wrapped in `<AuthGuard><MainLayout /></AuthGuard>`. Import feature configs and add to the `children` array.

---

## 3. State & Data Layer

### Global State (Zustand) — `src/store/`
```
src/store/
├── index.ts          ← Combined store + persist() config
└── slices/
    └── authSlice.ts  ← Auth state + actions
```
- **Slices** in `src/store/slices/` export a `StateCreator` function and a TypeScript interface.
- **`src/store/index.ts`** combines all slices and exports `useAppStore`.
- **Hydration safety**: `hasHydrated` flag + `onRehydrateStorage` prevent auth redirect flicker on page load.
- **`partialize`**: Only serialize `token` and `user` to localStorage — never the entire state.

### Server State (React Query) — `src/query/`
Files: `useCampaign.ts`, `useMedia.ts`, `useUserManagement.ts`

Rules:
- All `toast.success` / `toast.error` calls go in `onSuccess` / `onError` callbacks in the hook.
- All Zustand writes (e.g. `setUser`, `setToken`) go in `onSuccess` — never in components.
- Always call `queryClient.invalidateQueries({ queryKey: [...] })` after mutations.
- Use `keepPreviousData` / `placeholderData` for paginated lists.
- Pre-fetch adjacent pages using a dedicated `use*Prefetch` hook.

Destructuring pattern in components:
```typescript
const { mutate: addCampaign, isPending: addingCampaign } = useAddCampaign();
```

### API Services — `src/services/`
Files: `campaign.ts`, `media.ts`, `userManagement-service.ts`

```typescript
export const campaignService = {
  addCampaign: async (payload: AddCampaignFormValues) => {
    const response = await apiClient().post("addCampaign", payload);
    return response.data;
  },
};
```

### Zod Schemas — `src/utils/schemas/`
Files: `auth.ts`, `campaign.ts`, `type.ts`

```typescript
import { z } from "zod";
import type { InferSchemaType } from "./type";

export type AddCampaignFormValues = InferSchemaType<typeof addCampaignSchema>;
export const addCampaignSchema = z.object({ ... });
```
- Use nested sub-schemas for complex shapes.
- Use `.superRefine()` for cross-field conditional validation.

---

## 4. UI Pages — `src/pages/`

```
src/pages/
├── auth/           ← Login
├── campaign/
│   ├── campaign-config.tsx    ← nested parent route
│   ├── types.ts               ← Campaign response interface
│   ├── components/            ← shared campaign UI (campaign-details, campaign-objective)
│   ├── campaingList/          ← list sub-feature
│   └── campaingAdd/
│       ├── campaign-add.tsx         ← accordion multi-step form
│       ├── campaign-add-config.tsx
│       └── components/
│           ├── StepObjectiveInfo.tsx
│           ├── StepBudgetSchedule.tsx
│           ├── StepMmpIntegrations.tsx
│           ├── StepTargeting.tsx
│           ├── StepInventoryType.tsx
│           └── StepMediaCreatives.tsx
├── dashboard/
├── management/users/ + management/logs/
├── profile/
└── settings/theme/ + settings/account/
```

### Submit Handler Rule
Page submit handlers must only call `mutate(payload)` and handle navigation redirects. All other side effects belong in the query hook's callbacks.

---

## 5. Reusable Input Components — `src/components/inputComponents/`

| Component | When to use |
|-----------|------------|
| `SelectComponent` | Single-value select. Pass `search={true}` for searchable combobox (Popover+Command). Supports `errorTooltip`, `tooltip`. |
| `MultiSelectComponent` | Multi-value select with chip/tag display |
| `MultiStringComponent` | Free-text tag input (comma-separated strings) |
| `DatePickerComponent` | Calendar date picker |
| `ImageSelectComponent` | Media/image asset picker |

All components accept `ariaInvalid` for React Hook Form error state integration.

---

## 6. Data Constants — `src/utils/data/`

| File | Exports |
|------|---------|
| `campaignData.ts` | `PlatformTypeData`, `PlatformTypeFilterData`, `CampaignStatusData`, `CampaignStatusFilterData`, `MmpPlatformData`, `InventoryTypeData`, `AudienceTargetData` |
| `data.ts` | `geoData` (full ISO country list for geo-targeting) |

**Always import option arrays from these files. Never hardcode option arrays inline in components.**

---

## 7. Configurations

- **`src/configurations/sidebarConf.ts`** — sidebar navigation links. Update when adding new pages.
- **`src/api/config.ts`** — API endpoint registry. Register all new endpoints here.

---

## 8. Styling & Theme (Tailwind CSS v4 + Shadcn radix-maia)

All theme variables are in `src/index.css`. **Do not modify them unless explicitly instructed.**

| Rule | Detail |
|------|--------|
| **Sharp corners** | `--radius: 0`. Never use `rounded-xl`, `rounded-2xl`, etc. |
| **Tailwind v4 syntax** | Use `rounded-(--radius)` not `rounded-[var(--radius)]` |
| **Light bg** | `--background: oklch(0.985 0.003 325.6)` (soft Mauve); cards are white `oklch(1 0 0)` |
| **Scrollbar jitter** | Main wrapper uses `overflow-y-scroll` (not `overflow-y-auto`) |
| **Header** | Always `shrink-0` on `<header>` element |

---

## 9. Error Handling

Use `extractApiErrors()` from `src/utils/getErrorMessage.ts` to flatten API validation errors into string arrays for Sonner toast display:
```typescript
onError: (error: AxiosError<{ message?: string; data?: { message?: string } }>) => {
  const errorMsg = extractApiErrors(error.response?.data);
  errorMsg.forEach((msg) => toast.error(msg));
},
```
