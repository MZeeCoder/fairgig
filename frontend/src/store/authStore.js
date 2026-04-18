import { create } from 'zustand';
import Cookies from 'js-cookie';

const useAuthStore = create((set) => ({
  user: null,
  
  // Action to log in the user
  login: (userData, accessToken, refreshToken) => {
    // Set user state
    set({ user: userData });
    
    // Store accessToken in localStorage and refreshToken in cookies
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', accessToken);
    }
    if (refreshToken) {
      Cookies.set('refreshToken', refreshToken, { expires: 7});
    }
    Cookies.set('userRole', userData.role, { expires: 7, secure: process.env.NODE_ENV === 'production' });
  },

  // Action to log out the user
  logout: () => {
    // Clear state
    set({ user: null });
    
    // Remove tokens
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
    }
    Cookies.remove('refreshToken');
    Cookies.remove('userRole');
  },

  // Action to initialize state from storage
  initialize: () => {
    const token = Cookies.get('refreshToken');
    const userRole = Cookies.get('userRole');
    // In a real app, you'd verify the refresh token and fetch user data
    if (token && userRole) {
      set({ user: { role: userRole } }); // Set a minimal user object
    }
  }
}));

export default useAuthStore;
