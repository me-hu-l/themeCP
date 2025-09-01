"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import axios from "axios";

interface ContestHistoryContextType {
  user_contest: any[];
  setContest: (contest: any[]) => void;
}

const ContestHistoryContext = createContext<ContestHistoryContextType | undefined>(undefined);

export default function ContestHistoryProvider({ children }: { children: ReactNode }) {
  const [user_contest, setContest] = useState<any[]>([]);

  useEffect(() => {
    const backend_url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    axios
      .get(`${backend_url}/api/contests/me`, { withCredentials: true })
      .then((res) => setContest(res.data))
      .catch((error) => {
        console.error("Error fetching contest history:", error);
        setContest([]);
      });
  }, []);

  useEffect(() => {
    if (user_contest.length > 0) {
      // You can add any side-effect here that depends on user_contest
      // For example, logging or triggering another action
      console.log("Contest history updated:", user_contest);
    }
  }, [user_contest]);

  return (
    <ContestHistoryContext.Provider value={{ user_contest, setContest }}>
      {children}
    </ContestHistoryContext.Provider>
  );
}

export function useContestHistory() {
  const context = useContext(ContestHistoryContext);
  if (!context) throw new Error("useContestHistory must be used within ContestHistoryProvider");
  return context;
}