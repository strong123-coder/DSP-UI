import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createAuthSlice, type AuthSlice } from "./slices/authSlice";

export interface HydrationSlice {
  hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
}

export interface AppState extends AuthSlice, HydrationSlice {}

export const useAppStore = create<AppState>()(
  persist(
    (set, get, api) => ({
      ...createAuthSlice(set, get, api),
      hasHydrated: false,
      setHasHydrated: (state) => set({ hasHydrated: state }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        selectedOrg: state.selectedOrg,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

