"use client";

import { createContext, useEffect, useState, ReactNode, useContext } from "react";

interface LevelContextType {
  level: {};
  setLevel : (level: {}) => void; 
}
const LevelContext = createContext<LevelContextType | undefined>(undefined);

export default function LevelContextProvider({ children }: { children: ReactNode })  {

    const [level, setLevel] = useState({});

    useEffect(() => {
        const backend_url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const fetchLevel = async () => {
            fetch(`${backend_url}/api/levels`)
                .then(res => res.json())
                .then(res => setLevel(res))
                .catch(err => console.error(err));
        }
    
        fetchLevel();
    }, [])

    
    return (
        <LevelContext.Provider value={{level, setLevel}}>
            {children}
        </LevelContext.Provider>
    )

}

export function useLevel() {
  const context = useContext(LevelContext);
  if (!context) throw new Error("useLevel must be used within LevelContextProvider");
  return context;
}