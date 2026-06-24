import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createAuthSlice, type AuthSlice } from "./slices/authSlice";
import { createOrgSlice, type OrgSlice } from "./slices/orgSlice";

export interface HydrationSlice {
  hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
}

export interface AppState extends AuthSlice, OrgSlice, HydrationSlice {}

export const useAppStore = create<AppState>()(
  persist(
    (set, get, api) => ({
      ...createAuthSlice(set, get, api),
      ...createOrgSlice(set, get, api),
      hasHydrated: false,
      setHasHydrated: (state) => set({ hasHydrated: state }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        selectedOrg: state.selectedOrg,
        orgConfig: state.orgConfig,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
