import { createContext, useContext, useEffect, useState } from "react";
import { getCurrentUser, logout as clearStoredAuth } from "../services/authService";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getCurrentUser());

  const login = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    clearStoredAuth();
    setUser(null);
  };

  useEffect(() => {
    const handleStorageChange = () => {
      setUser(getCurrentUser());
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
