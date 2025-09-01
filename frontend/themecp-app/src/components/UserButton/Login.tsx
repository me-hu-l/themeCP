"use client";

import React from "react";
import { useRouter } from "next/navigation";

const LogIn: React.FC = () => {
  const router = useRouter();

  const handleClick = () => {
    router.push("/login");
  };

  return (
    <div>
      <button
        onClick={handleClick}
        className="font-bold bg-black text-white rounded-lg h-10 w-[90px] cursor-pointer transition duration-200 hover:opacity-80 active:opacity-50 max-[730px]:w-[50px] max-[730px]:h-[30px]"
      >
        Login
      </button>
    </div>
  );
};

export default LogIn;
