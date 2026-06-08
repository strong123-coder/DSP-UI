import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAppStore } from "@/store";
import LoadingFallback from "@/components/ui/loading-fallback";
import { apiClient } from "@/api/apiClient";

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const token = useAppStore((state) => state.token);
  const hasHydrated = useAppStore((state) => state.hasHydrated);
  const [loadingConfig, setLoadingConfig] = useState(true);

  useEffect(() => {
    if (!hasHydrated || !token) {
      setLoadingConfig(false);
      return;
    }

    const fetchConfig = async () => {
      try {
        const orgConfigStr = sessionStorage.getItem("orgConfig");
        if (!orgConfigStr) {
          const configResponse = await apiClient().get("getOrgConfig");
          sessionStorage.setItem("orgConfig", JSON.stringify(configResponse.data));
        }
      } catch (error) {
        console.error("Failed to fetch organization config:", error);
      } finally {
        setLoadingConfig(false);
      }
    };

    fetchConfig();
  }, [hasHydrated, token]);

  // Prevent redirect flicker during Zustand store hydration or while fetching config
  if (!hasHydrated || (token && loadingConfig)) {
    return <LoadingFallback />;
  }

  // If hydrated and no token, redirect to login
  if (!token) {
    console.warn("User not authenticated, navigating to login");
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
