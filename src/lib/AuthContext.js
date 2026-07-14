"use client";

import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("keyframe_user");
      console.log(stored);
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to parse stored user", e);
    }
    setIsLoading(false);
  }, []);

  const login = (userData) => {
    // userData: { displayName, email, username, profilePic }
    const userObj = {
      displayName: userData.displayName,
      email: userData.email,
      username: userData.username,
      profilePic: userData.profilePic || "",
    };
    setUser(userObj);
    localStorage.setItem("keyframe_user", JSON.stringify(userObj));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("keyframe_user");
  };

  // Generate initials from display name (first 2 letters of first 2 words)
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
