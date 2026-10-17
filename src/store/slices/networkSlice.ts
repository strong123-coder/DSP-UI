import { type StateCreator } from "zustand";

// The network an org user (or a super admin inside an org) has "entered".
// When set, the API client sends it as the `x-network-id` header and every
// network-scoped endpoint answers for that network only. Network users never
// set this: their network comes from their login.
export interface SelectedNetwork {
  id: string;
  name: string;
}

export interface NetworkState {
  selectedNetwork: SelectedNetwork | null;
}

export interface NetworkActions {
  enterNetwork: (network: SelectedNetwork) => void;
  exitNetwork: () => void;
}

export type NetworkSlice = NetworkState & NetworkActions;

export const createNetworkSlice: StateCreator<NetworkSlice, [], [], NetworkSlice> = (set) => ({
  selectedNetwork: null,
  enterNetwork: (network) => set({ selectedNetwork: network }),
  exitNetwork: () => set({ selectedNetwork: null }),
});
