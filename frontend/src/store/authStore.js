import { create } from "zustand";
import Cookies from "js-cookie";
import { clearClientAuth, setClientAuth } from "@/lib/clientAuth";

const useAuthStore = create((set) => ({
  user: null,

  login: (userData, accessToken, refreshToken) => {
    set({ user: userData });

    setClientAuth({ accessToken, userRole: userData.role });
    if (refreshToken) {
      Cookies.set("refreshToken", refreshToken, { expires: 7 });
    }
    Cookies.set("userRole", userData.role, {
      expires: 7,
      secure: process.env.NODE_ENV === "production",
    });
  },

  // Action to log out the user
  logout: () => {
    // Clear state
    set({ user: null });

    // Remove tokens
    clearClientAuth();
    Cookies.remove("refreshToken");
    Cookies.remove("userRole");
  },

  // Action to initialize state from storage
  initialize: () => {
    const token = Cookies.get("refreshToken");
    const userRole = Cookies.get("userRole");
    // In a real app, you'd verify the refresh token and fetch user data
    if (token && userRole) {
      set({ user: { role: userRole } }); // Set a minimal user object
    }
  },
}));

export default useAuthStore;
