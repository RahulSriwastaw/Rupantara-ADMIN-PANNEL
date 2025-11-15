"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAdminAuthStore } from "@/store/adminAuthStore"
import { AdminSidebar } from "@/components/layout/AdminSidebar"
import { AdminHeader } from "@/components/layout/AdminHeader"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, admin, token, hasHydrated, markHydrated } = useAdminAuthStore()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)

  useEffect(() => {
    setMounted(true)
    
    // Clear any stale/invalid auth data on mount
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('rupantar-admin-auth');
        if (stored) {
          const parsed = JSON.parse(stored);
          const state = parsed.state || parsed;
          // Validate stored state - must have valid admin and token
          const hasValidStoredAdmin = state.admin && state.admin.id && state.admin.email;
          const hasValidStoredToken = state.token && state.token.length > 0;
          
          if (!hasValidStoredAdmin || !hasValidStoredToken || !state.isAuthenticated) {
            console.log('Invalid stored auth state detected on mount, clearing and redirecting...');
            localStorage.removeItem('rupantar-admin-auth');
            useAdminAuthStore.getState().logout();
            // Immediately redirect to login
            router.replace("/login");
            return;
          }
        } else {
          // No stored auth, ensure we're logged out and redirect
          console.log('No stored auth found, redirecting to login');
          useAdminAuthStore.getState().logout();
          router.replace("/login");
          return;
        }
      } catch (e) {
        console.log('Error parsing stored auth, clearing and redirecting...', e);
        localStorage.removeItem('rupantar-admin-auth');
        useAdminAuthStore.getState().logout();
        router.replace("/login");
        return;
      }
    }
    
    // Mark as hydrated after cleanup
    markHydrated()
  }, [markHydrated, router])

  useEffect(() => {
    if (!mounted) return
    
    // Function to check and redirect if not authenticated
    const checkAuth = () => {
      const hasValidAdmin = admin !== null && admin !== undefined && admin.id && admin.email;
      const hasValidToken = token !== null && token !== undefined && token.length > 0;
      const isReallyAuthenticated = isAuthenticated === true && hasValidAdmin && hasValidToken;
      
      console.log('Dashboard layout - Auth check:', {
        isAuthenticated,
        hasValidAdmin,
        hasValidToken,
        isReallyAuthenticated,
        adminId: admin?.id,
        tokenLength: token?.length,
        hasHydrated
      });
      
      if (!isReallyAuthenticated) {
        console.log('Dashboard layout: Not authenticated, redirecting to login');
        // Clear any stale auth data immediately
        if (typeof window !== 'undefined') {
          localStorage.removeItem('rupantar-admin-auth');
          useAdminAuthStore.getState().logout();
        }
        router.replace("/login");
        return;
      }
      
      // Authenticated, allow access
      setCheckingAuth(false);
    };

    // Check immediately, don't wait for hydration
    // This ensures we redirect quickly if not authenticated
    checkAuth();
    
    // Also check after hydration completes
    if (!hasHydrated) {
      const hydrationTimeout = setTimeout(() => {
        checkAuth();
      }, 500);
      return () => clearTimeout(hydrationTimeout);
    }

    // Also set a timeout to ensure we don't get stuck
    const timeout = setTimeout(() => {
      if (checkingAuth) {
        checkAuth();
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [mounted, hasHydrated, isAuthenticated, admin, token, router, checkingAuth])

  // Show loading while checking auth or not mounted
  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    )
  }

  // While checking auth, show loading
  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Checking authentication...</p>
      </div>
    )
  }

  // Final check - if still not authenticated, redirect
  const hasValidAdmin = admin !== null && admin !== undefined && admin.id && admin.email;
  const hasValidToken = token !== null && token !== undefined && token.length > 0;
  const isReallyAuthenticated = isAuthenticated === true && hasValidAdmin && hasValidToken;
  
  if (!isReallyAuthenticated) {
    // Clear auth and redirect - this should have been handled in useEffect, but double-check
    console.log('Dashboard layout final check: Not authenticated, redirecting');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('rupantar-admin-auth');
      useAdminAuthStore.getState().logout();
      router.replace("/login");
    }
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Redirecting to login page...</p>
      </div>
    );
  }

  // If authenticated, render the dashboard
  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto bg-background p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

