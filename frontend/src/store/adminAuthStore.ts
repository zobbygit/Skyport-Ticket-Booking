import { create } from "zustand";

export type AdminRole = "SUPER_ADMIN" | "OPERATIONS_ADMIN" | "FLIGHT_MANAGER";

export interface AdminUser {
  id: string;
  full_name: string;
  email: string;
  role: AdminRole;
}

interface AdminAuthState {
  admin: AdminUser | null;
  setAdmin: (a: AdminUser | null) => void;
}

export const useAdminAuthStore = create<AdminAuthState>((set) => ({
  admin: null,
  setAdmin: (a) => set({ admin: a }),
}));
