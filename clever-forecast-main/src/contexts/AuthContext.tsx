import React, { createContext, useContext, useState, useCallback } from "react";

interface User {
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback(async (email: string, _password: string) => {
    // Mock login — replace with real API call
    await new Promise((r) => setTimeout(r, 800));
    setUser({ email, name: email.split("@")[0] });
  }, []);

  const signup = useCallback(async (name: string, email: string, _password: string) => {
    // Mock signup — replace with real API call
    await new Promise((r) => setTimeout(r, 800));
    setUser({ email, name });
  }, []);

  const logout = useCallback(() => setUser(null), []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
