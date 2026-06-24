import { type StateCreator } from "zustand";

// The organisation a super admin has "entered" (impersonation context). When
// set, the API client sends it as the `x-org-id` header so every org-scoped
// endpoint resolves to this org. null = super admin is in the all-orgs area.
export interface SelectedOrg {
  id: string;
  name: string;
}

export interface OrgState {
  selectedOrg: SelectedOrg | null;
  orgConfig: any | null;
}

export interface OrgActions {
  enterOrg: (org: SelectedOrg) => void;
  exitOrg: () => void;
  setOrgConfig: (config: any) => void;
}

export type OrgSlice = OrgState & OrgActions;

export const createOrgSlice: StateCreator<OrgSlice, [], [], OrgSlice> = (
  set,
) => ({
  selectedOrg: null,
  orgConfig: null,
  enterOrg: (org) => set({ selectedOrg: org, orgConfig: null }),
  exitOrg: () => set({ selectedOrg: null, orgConfig: null }),
  setOrgConfig: (config) => set({ orgConfig: config }),
});
