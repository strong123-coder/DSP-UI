import { type StateCreator } from "zustand";

export interface User {
  _id: string;
  name: string;
  email: string;
  type: string;
  orgId?: string; // absent for super_admin
}

// The organisation a super admin has "entered" (impersonation context). When
// set, the API client sends it as the `x-org-id` header so every org-scoped
// endpoint resolves to this org. null = super admin is in the all-orgs area.
export interface SelectedOrg {
  id: string;
  name: string;
}

export interface AuthState {
  token: string | null;
  user: User | null;
  selectedOrg: SelectedOrg | null;
}

export interface AuthActions {
  login: (token: string, user: User) => void;
  logout: () => void;
  enterOrg: (org: SelectedOrg) => void;
  exitOrg: () => void;
}

export type AuthSlice = AuthState & AuthActions;

export const createAuthSlice: StateCreator<AuthSlice, [], [], AuthSlice> = (
  set
) => ({
  token: null,
  user: null,
  selectedOrg: null,
  login: (token, user) => set({ token, user, selectedOrg: null }),
  logout: () => set({ token: null, user: null, selectedOrg: null }),
  enterOrg: (org) => set({ selectedOrg: org }),
  exitOrg: () => set({ selectedOrg: null }),
});
