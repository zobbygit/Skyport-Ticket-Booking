import { create } from "zustand";
import { Account } from "../types";
import { api } from "../lib/api";
import { connectSocket, disconnectSocket } from "../lib/socket";

interface AuthState {
  account: Account | null;
  isAdmin: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  setAccount: (account: Account | null, opts?: { admin?: boolean; token?: string }) => void;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  account: null,
  isAdmin: false,
  isLoading: true,
  isAuthenticated: false,

  setAccount: (account, opts) => {
    if (account && opts?.token) {
      localStorage.setItem("skyport_token", opts.token);
      connectSocket(opts.token);
    }
    set({ account, isAdmin: !!opts?.admin, isAuthenticated: !!account, isLoading: false });
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      localStorage.removeItem("skyport_token");
      disconnectSocket();
      set({ account: null, isAdmin: false, isAuthenticated: false });
    }
  },

  hydrate: async () => {
    // Try passenger session first, then admin session.
    try {
      const res = await api.get("/auth/me");
      get().setAccount(res.data.data, { admin: false });
      return;
    } catch {
      /* not a passenger session */
    }
    try {
      const res = await api.get("/auth/admin/me");
      get().setAccount(res.data.data, { admin: true });
      return;
    } catch {
      /* not an admin session either */
    }
    set({ isLoading: false });
  },
}));
