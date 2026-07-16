"use client";

import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount: check if the user has a valid session by calling /api/auth/me
  // The browser automatically sends the HTTP-Only cookie — we don't touch it
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) throw new Error("Not authenticated");
        return res.json();
      })
      .then((data) => {
        setUser(data.user);
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // Called after login/signup — just sets user state
  // The cookie is already set by the server response
  const login = (userData) => {
    setUser({
      id: userData.id,
      displayName: userData.displayName,
      email: userData.email,
      username: userData.username,
      profilePic: userData.profilePic || "",
    });
  };

  // Calls the logout API to clear the HTTP-Only cookie
  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
  };

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
    <AuthContext.Provider value={{ user, isLoading, login, logout, getInitials }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
