"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import Cookies from "js-cookie";
import axios from "axios";

interface AuthContextType {
  isAuth: boolean;
  loading: boolean;
  setIsAuth: (auth: boolean) => void;
  setLoading: (loading: boolean) => void;

}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Checking authentication status...");
    // const token = Cookies.get("token");
    // if (!token) {
    //   console.log("No token found, setting isAuth to false");
    //   setIsAuth(false);
    //   setLoading(false);
    //   return;
    // }
    const backend_url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"; // Fallback to local URL if env variable is not set
    console.log("Backend URL:", backend_url);
    axios
      .get(`${backend_url}/api/users/me`, {
        // headers: { Authorization: `Bearer ${token}` },
        withCredentials: true // Ensure cookies are sent with the request
      })
      .then((res) => {
        if (res.status === 200) {
          setIsAuth(true);
        } else {
          setIsAuth(false);
        }
      })
      .catch(() => setIsAuth(false))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    console.log("Authentication status updated:", isAuth);
    // console.log("user authenticated:", loading);
  }, [isAuth]);

  return (
    <AuthContext.Provider value={{ isAuth, loading, setIsAuth, setLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
