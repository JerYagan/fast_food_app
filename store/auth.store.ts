import { account, getCurrentUser } from "@/lib/appwrite";
import { AppUser } from "@/type";
import { create } from "zustand";

type AuthState = {
  isAuthenticated: boolean;
  user: AppUser | null;
  isLoading: boolean;

  setIsAuthenticated: (value: boolean) => void;
  setUser: (user: AppUser | null) => void;
  setLoading: (loading: boolean) => void;

  fetchAuthenticatedUser: () => Promise<void>;
};

const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  isLoading: true,

  setIsAuthenticated: (value) => set({ isAuthenticated: value }),

  setUser: (user) => set({ user }),
  setLoading: (value) => set({ isLoading: value }),

  fetchAuthenticatedUser: async () => {
    try {
      const accountUser = await account.get();

      set({
        user: {
          name: accountUser.name,
          email: accountUser.email,
          avatar: accountUser.prefs?.avatar ?? null,
        },
        isAuthenticated: true,
      });
    } catch (e) {
      console.log("fetchAuthenticatedUser error", e);
      set({ isAuthenticated: false, user: null });
    } finally {
      set({ isLoading: false });
    }
  },
}));

export default useAuthStore;