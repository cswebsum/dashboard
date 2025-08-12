import { create } from 'zustand';

export type Role = 'admin' | 'viewer' | 'operator';

interface AuthzState {
  roles: Role[];
  setRoles: (roles: Role[]) => void;
  hasAnyRole: (required: Role[]) => boolean;
}

export const useAuthzStore = create<AuthzState>((set, get) => ({
  roles: (localStorage.getItem('roles') || 'viewer').split(',') as Role[],
  setRoles: (roles) => {
    localStorage.setItem('roles', roles.join(','));
    set({ roles });
  },
  hasAnyRole: (required) => {
    if (required.length === 0) return true;
    const mine = new Set(get().roles);
    return required.some((r) => mine.has(r));
  },
}));