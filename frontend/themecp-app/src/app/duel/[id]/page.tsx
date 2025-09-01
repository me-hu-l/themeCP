'use client';

import Navbar from "@/components/Navbar/Navbar";
import LoginPage from "@/pages/LoginPage/LoginPage";
import Contest from "@/pages/Contest/Contest";
import StartContest from "@/pages/StartContest/StartContest";
import PrivateRoute from "@/components/PrivateRoute/PrivateRoute";
import React from "react";
import { useParams } from "react-router-dom";
import Duel from "@/pages/Duel/Duel";
export default function Page() {
  const { id } = useParams();
  return (
    <div>
      <PrivateRoute>
        <Navbar />
        <Duel id={id} />
        {/* <StartContest /> */}
      </PrivateRoute>
    </div>
  );
}