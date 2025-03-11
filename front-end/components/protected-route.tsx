"use client"

import { useAuth } from "@/lib/auth";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  
  useEffect(() => {
    // If auth check is done and user is not authenticated
    if (!isLoading && !isAuthenticated) {
      // Store the current path for potential redirect after login
      localStorage.setItem('redirectAfterLogin', pathname);
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router, pathname]);
  
  // Show nothing while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // Only render children if authenticated
  return isAuthenticated ? <>{children}</> : null;
}

