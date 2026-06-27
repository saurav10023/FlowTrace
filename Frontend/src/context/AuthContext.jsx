import { createContext, useContext, useEffect, useState } from "react";
import API from "../api/axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser && storedUser !== "undefined") {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.warn("Corrupted user in localStorage:", err);
        localStorage.removeItem("user");
      }
    }
    refreshUser();
  }, []);

  const refreshUser = async () => {
    try {
      const res = await API.get("/api/v1/users/me");
      setUser(res.data.data);
      localStorage.setItem("user", JSON.stringify(res.data.data));
    } catch (error) {
      // Only wipe session on a real 401 — not network errors or server hiccups
      if (error.response?.status === 401) {
        clearUser();
      }
    } finally {
      setLoading(false);
    }
  };

  const login = (data) => {
    setUser(data.user);
    localStorage.setItem("user", JSON.stringify(data.user));
    if (data.accessToken) localStorage.setItem("accessToken", data.accessToken);
  };

  const clearUser = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    setUser(null);
  };

  const logout = async () => {
    try {
      await API.post("/api/v1/users/logout");
    } catch (err) {
      console.error("Logout error", err);
    } finally {
      clearUser();
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, setUser, refreshUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);