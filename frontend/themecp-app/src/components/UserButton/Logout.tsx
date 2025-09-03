"use client";

import React from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";

const Logout = () => {
  const router = useRouter();

  const {setIsAuth} = useAuth();

  const handleClick = async () => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/users/logout`,
        {},
        { withCredentials: true }
      );
      setIsAuth(false);
      alert("Logged out successfully");
      router.push("/");
    } catch (error:any) {
      // Network error (no response)
      if(!error.response){
        alert("Network error. Please try again later.");
      }else{
        // Backend responded with error status
        const detail =
          error.response.data?.detail ||
          error.response.data?.message ||
          JSON.stringify(error.response.data) ||
          "Unknown error";
        alert(`Logout failed: ${detail}`);
      }
      setIsAuth(true);
      router.push("/");
    }
  };

  return (
    <div>
      <button
        onClick={handleClick}
        className="font-bold bg-black text-white rounded-lg h-10 w-[90px] cursor-pointer transition duration-200 hover:opacity-80 active:opacity-50 max-[730px]:w-[50px] max-[730px]:h-[30px]"
      >
        Logout
      </button>
    </div>
  );
};

export default Logout;
