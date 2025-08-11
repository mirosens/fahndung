"use client";
import { createContext, useContext } from "react";
import { useAuth as useAuthHook } from "~/hooks/useAuth";
import type { Session } from "~/lib/auth";

interface AuthContextType {
  user: Session["user"] | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
  checkSession: (force?: boolean) => Promise<void>;
  error: string | null;
  timeoutReached: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  initialized: false,
  isAuthenticated: false,
  logout: async () => {},
  checkSession: async () => {},
  error: null,
  timeoutReached: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuthHook();

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
