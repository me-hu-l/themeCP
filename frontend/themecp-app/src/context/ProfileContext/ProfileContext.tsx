"use client";

import axios from "axios";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface ProfileContextType {
  user_profile: any;
  setProfile: (profile: any) => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export default function ProfileProvider({ children }: { children: ReactNode }) {
  const [user_profile, setProfile] = useState<any>({});

  useEffect(() => {
    // You can fetch and set profile here if needed
    console.log("Profile context initialized");
    // Example: Fetch user profile from an API endpoint
    const backend_url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"; // Fallback to local URL if env variable is not set
    console.log("Backend URL:", backend_url);
    axios
      .get(`${backend_url}/api/users/me`, {
        // headers: { Authorization: `Bearer ${token}` },
        withCredentials: true // Ensure cookies are sent with the request
      }).then((res) => setProfile(res.data))
      .catch((error) => {
        console.error("Error fetching user profile:", error);
        setProfile({}); // Set to empty array on error
      });
      // console.log("User profile fetched:", user_profile);
      // console.log('username:', user_profile.username);
  }, []);

  useEffect(() => {
    if (user_profile) {
      console.log("User profile updated:", user_profile);
    }
  },[user_profile])

  return (
    <ProfileContext.Provider value={{ user_profile, setProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) throw new Error("useProfile must be used within ProfileProvider");
  return context;
}