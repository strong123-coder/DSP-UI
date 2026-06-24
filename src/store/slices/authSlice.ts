import { type StateCreator } from "zustand";

export interface User {
  _id: string;
  name: string;
  email: string;
  type: string;
  orgId?: string; // absent for super_admin
}

export interface AuthState {
  token: string | null;
  user: User | null;
}

export interface AuthActions {
  login: (token: string, user: User) => void;
  logout: () => void;
}

export type AuthSlice = AuthState & AuthActions;

export const createAuthSlice: StateCreator<AuthSlice, [], [], AuthSlice> = (
  set,
) => ({
  token: null,
  user: null,
  login: (token, user) => set({ token, user }),
  logout: () => set({ token: null, user: null }),
});
