"use client";

import "./globals.css";
import { ReactNode, useEffect, useState } from "react";
// import Navbar from "@/components/Navbar/Navbar";
import LevelContextProvider from "@/context/LevelContext";
import ProfileContextProvider from "@/context/ProfileContext/ProfileContext";
import ContestHistoryContextProvider from "@/context/ProfileContext/ContestHistoryContext";
import AuthProvider from "@/context/AuthContext"
import { usePathname } from "next/navigation";
import Cookies from "js-cookie";
import ReactGA from "react-ga4";

export default function RootLayout({ children }: { children: ReactNode }) {
  // const [isAuth, setIsAuth] = useState(false);
  // const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  // Auth check
  // useEffect(() => {
  //   const checkAuth = async () => {
  //     try {
  //       const res = await fetch("https://themecp.up.railway.app/api/authenticate", {
  //         headers: {
  //           Authorization: `Bearer ${Cookies.get("token")}`,
  //         },
  //       });
  //       setIsAuth(res.ok);
  //     } catch {
  //       setIsAuth(false);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   checkAuth();
  // }, []);

  // Google Analytics tracking
  // useEffect(() => {
  //   ReactGA.initialize(process.env.NEXT_PUBLIC_GA4_ID || "");
  //   ReactGA.send({
  //     hitType: "pageview",
  //     page: pathname,
  //     title: document.title,
  //   });
  // }, [pathname]);

  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <LevelContextProvider>
            <ProfileContextProvider>
              <ContestHistoryContextProvider>
                {/* Navbar on all pages */}
                {/* <Navbar auth={isAuth} /> */}
                { children }
                {/* {loading ? <div>Loading...</div> : children} */}
              </ContestHistoryContextProvider>
            </ProfileContextProvider>
          </LevelContextProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
