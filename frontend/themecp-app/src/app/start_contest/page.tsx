'use client';

import Navbar from "@/components/Navbar/Navbar";
import LoginPage from "@/pages/LoginPage/LoginPage";
import Contest from "@/pages/Contest/Contest";
import StartContest from "@/pages/StartContest/StartContest";
import PrivateRoute from "@/components/PrivateRoute/PrivateRoute";
export default function Page() {
  return (
    <div>
      <PrivateRoute>
        <Navbar />
        <StartContest />
      </PrivateRoute>
    </div>
  );
}