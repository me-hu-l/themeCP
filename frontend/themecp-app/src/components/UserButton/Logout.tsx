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
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/users/logout`,
        {},
        { withCredentials: true }
      );
      setIsAuth(false);
      alert("Logged out successfully");
      router.push("/");
    } catch (error) {
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
