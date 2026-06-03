import React from "react";
import { Navigate } from "react-router-dom";
import { useAppStore } from "@/store";
import LoadingFallback from "@/components/ui/loading-fallback";

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const token = useAppStore((state) => state.token);
  const hasHydrated = useAppStore((state) => state.hasHydrated);

  // Prevent redirect flicker during Zustand store hydration
  if (!hasHydrated) {
    return <LoadingFallback />;
  }

  // If hydrated and no token, redirect to login
  if (!token) {
    console.warn("User not authenticated, navigating to login");
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
