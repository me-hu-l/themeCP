"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import logo from "../../../public/levelupcplogo.png";
import LogIn from "../UserButton/Login";
import Logout from "../UserButton/Logout";
import { useProfile } from "@/context/ProfileContext/ProfileContext";
import UserSearch from "../UserSearch/UserSearch";
// import { useRouter } from "next/router";
// import "./Navbar.module.css"

const Navbar = () => {
  const { isAuth } = useAuth();
  const { user_profile } = useProfile();
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href;

  return (
    <div className="flex items-center justify-between px-[30px] pt-[5px] pb-[20px] text-black font-mono font-semibold text-[20px]">
      <button
        className="logo-btn"
        onClick={() => router.push("/")}
        aria-label="Go home"
      >
        <Image src={logo} alt="LevelUp CP logo" className="w-[200px] cursor-pointer max-[730px]:w-[100px]" priority />
      </button>

      

      <div className="flex items-center gap-[1px]">
        {/* 🔍 User Search in Navbar */}
      <div className="mx-4 w-[250px] max-[730px]:hidden">
        <UserSearch />
      </div>
        <ul className="flex list-none p-0 m-0 justify-center">
          <li className="mr-[30px] max-[730px]:mr-[10px]">
            <Link className="relative block after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[0.1em] after:bg-pink-500 after:opacity-0 after:scale-0 after:transition-all after:duration-300 hover:after:opacity-100 hover:after:scale-100 focus:after:opacity-100 focus:after:scale-100 max-[730px]:text-[10px]"
             href="/">Home</Link>
          </li>
          <li className="mr-[30px] max-[730px]:mr-[10px]">
            <Link className="relative block after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[0.1em] after:bg-pink-500 after:opacity-0 after:scale-0 after:transition-all after:duration-300 hover:after:opacity-100 hover:after:scale-100 focus:after:opacity-100 focus:after:scale-100 max-[730px]:text-[10px]"
             href="/guide">Guide</Link>
          </li>
          <li className="mr-[30px] max-[730px]:mr-[10px]">
            <Link className="relative block after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[0.1em] after:bg-pink-500 after:opacity-0 after:scale-0 after:transition-all after:duration-300 hover:after:opacity-100 hover:after:scale-100 focus:after:opacity-100 focus:after:scale-100 max-[730px]:text-[10px]"
             href="/level_sheet">Level Sheet</Link>
          </li>
          <li className="mr-[30px] max-[730px]:mr-[10px]">
            <Link className="relative block after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[0.1em] after:bg-pink-500 after:opacity-0 after:scale-0 after:transition-all after:duration-300 hover:after:opacity-100 hover:after:scale-100 focus:after:opacity-100 focus:after:scale-100 max-[730px]:text-[10px]"
             href="/contest">Contest</Link>
          </li>
          <li className="mr-[30px] max-[730px]:mr-[10px]">
            <Link className="relative block after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[0.1em] after:bg-pink-500 after:opacity-0 after:scale-0 after:transition-all after:duration-300 hover:after:opacity-100 hover:after:scale-100 focus:after:opacity-100 focus:after:scale-100 max-[730px]:text-[10px]"
             href="/duel">Duel</Link>
          </li>
          {isAuth && (
            <li className="mr-[30px] max-[730px]:mr-[10px]">
              <Link className="relative block after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[0.1em] after:bg-pink-500 after:opacity-0 after:scale-0 after:transition-all after:duration-300 hover:after:opacity-100 hover:after:scale-100 focus:after:opacity-100 focus:after:scale-100 max-[730px]:text-[10px]"
               href={`/profile/${user_profile.id}`}>Profile</Link>
            </li>
          )}
        </ul>
          {isAuth ? <Logout />:<LogIn />}
        {/* auth buttons go here later */}
      </div>
    </div>
  );
};

export default Navbar;
