import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Role = 'OPERATOR' | 'MANAGER' | 'ADMIN';

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  setSession: (payload: { user: AuthUser; token: string | null }) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setSession: ({ user, token }) => set({ user, token }),
      clear: () => set({ user: null, token: null }),
    }),
    { name: 'ahcf-cps-auth' },
  ),
);
