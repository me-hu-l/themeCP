"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuth, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuth) {
      console.log("User is not authenticated, redirecting to login.", isAuth, loading);
      router.push("/login");
    }
  }, [isAuth, loading, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuth) {
    return null; // don't render until redirect happens
  }

  return <>{children}</>;
}
