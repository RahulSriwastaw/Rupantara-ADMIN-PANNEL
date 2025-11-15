import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Admin } from '@/types/admin';

interface AdminAuthState {
  admin: Admin | null;
  token: string | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  markHydrated: () => void;
}

export const useAdminAuthStore = create<AdminAuthState>()(
  persist(
    (set, get) => ({
      admin: null,
      token: null,
      isAuthenticated: false,
      hasHydrated: false,
      markHydrated: () => {
        // When marking as hydrated, validate the state
        const state = get();
        const hasValidAdmin = state.admin !== null && state.admin !== undefined && state.admin.id && state.admin.email;
        const hasValidToken = state.token !== null && state.token !== undefined && state.token.length > 0;
        
        if (!hasValidAdmin || !hasValidToken) {
          // Invalid state, reset
          set({ 
            hasHydrated: true,
            isAuthenticated: false,
            admin: null,
            token: null
          });
        } else {
          set({ hasHydrated: true });
        }
      },
      login: async (email: string, password: string) => {
        console.log('Login attempt with:', { email });
        
        try {
          // Get API URL from environment or use default
          // Try multiple possible API URLs
          const possibleUrls = [
            process.env.NEXT_PUBLIC_API_URL,
            'http://localhost:4000/api',
            'http://127.0.0.1:4000/api',
            'http://192.168.0.109:4000/api', // Local network IP
          ].filter(Boolean);
          
          let lastError: Error | null = null;
          
          // Try each URL until one works
          for (const API_URL of possibleUrls) {
            try {
              console.log(`Trying API URL: ${API_URL}/admin/auth/login`);
              
              const response = await fetch(`${API_URL}/admin/auth/login`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
              });
              
              // Check if we got a valid response (not a network error)
              if (response && response.status !== 0) {
                // This URL works, process the response
                if (!response.ok) {
                  const errorData = await response.json().catch(() => ({ error: 'Login failed' }));
                  console.error('Login error response:', errorData);
                  throw new Error(errorData.error || 'Invalid credentials');
                }

                const data = await response.json();
                console.log('Login response:', data);
                
                if (!data.admin || !data.token) {
                  console.error('Invalid response structure:', data);
                  throw new Error('Invalid response from server');
                }

                const admin: Admin = {
                  id: data.admin.id,
                  email: data.admin.email,
                  name: data.admin.name,
                  role: data.admin.role,
                  permissions: data.admin.permissions,
                  createdAt: data.admin.createdAt || new Date().toISOString(),
                  isActive: data.admin.isActive !== undefined ? data.admin.isActive : true,
                };

                console.log('Login successful, setting isAuthenticated to true');
                set({ admin, token: data.token, isAuthenticated: true });
                return; // Success, exit function
              }
            } catch (urlError: any) {
              console.warn(`Failed to connect to ${API_URL}:`, urlError.message);
              lastError = urlError;
              // Continue to next URL
            }
          }
          
          // If we get here, all URLs failed
          if (lastError) {
            throw lastError;
          }
          throw new Error('Unable to connect to backend server. Please check if the server is running.');
        } catch (error: any) {
          console.error('Login failed:', error);
          // Provide more helpful error messages
          if (error.message?.includes('fetch') || error.message?.includes('network')) {
            throw new Error('Unable to connect to backend server. Please check if the server is running on port 4000.');
          }
          throw new Error(error.message || "Invalid credentials");
        }
      },
      logout: () => {
        console.log('Logging out, setting isAuthenticated to false');
        set({ admin: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: 'rupantar-admin-auth',
      // Add partialize to only persist certain fields
      partialize: (state) => ({ isAuthenticated: state.isAuthenticated, admin: state.admin, token: state.token }),
      onRehydrateStorage: () => (state) => {
        // Validate rehydrated state - if admin or token is missing, reset auth
        if (state) {
          const hasValidAdmin = state.admin !== null && state.admin !== undefined && state.admin.id && state.admin.email;
          const hasValidToken = state.token !== null && state.token !== undefined && state.token.length > 0;
          
          if (!hasValidAdmin || !hasValidToken || !state.isAuthenticated) {
            console.log('Invalid auth state detected during rehydration, resetting...');
            state.isAuthenticated = false;
            state.admin = null;
            state.token = null;
          }
          // Always mark as hydrated
          if (state.markHydrated) {
            state.markHydrated();
          }
        }
      },
    }
  )
);

