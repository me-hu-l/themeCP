"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

const LoginPage: React.FC = () => {
  const router = useRouter();

  const handleGoogleLogin = () => {
    window.location.href =
      `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"}/api/auth/google/login`;
  };

  return (
    <div>
      <div className="w-full h-[100px] mt-[200px] flex justify-center items-center">
        <button
          onClick={handleGoogleLogin}
          className="border border-black w-[320px] h-[50px] flex justify-center items-center rounded-[20px] cursor-pointer shadow-[5px_5px_10px_1px_black] transition-opacity duration-150 hover:opacity-80 active:shadow-none active:ml-[2px] active:mt-[2px] bg-white"
        >
          <span className="flex items-center">
            <Image
              src="/google.png"
              alt="Google"
              width={30}
              height={30}
              className="mr-2"
            />
            <span className="font-semibold text-black">Sign in with Google</span>
          </span>
        </button>
      </div>
      <center className="text-black font-semibold text-[14px] mt-4">
        <Link href="/privacy_policy">
          <br />
          By creating an account or signing in you agree to our Terms and Conditions
        </Link>
      </center>
    </div>
  );
};

export default LoginPage;