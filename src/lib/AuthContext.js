"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { createContext, useContext } from "react";

// We keep a lightweight context just for our helper functions like getInitials
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  return (
    <SessionProvider>
      <AuthHelperProvider>{children}</AuthHelperProvider>
    </SessionProvider>
  );
}

// Internal provider that has access to the NextAuth session
function AuthHelperProvider({ children }) {
  const { data: session, status } = useSession();

  const user = session?.user || null;
  const isLoading = status === "loading";

  // Generate initials from display name
  const getInitials = (name) => {
    if (!name) return "??";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, getInitials }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to replace our old useAuth hook seamlessly
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
