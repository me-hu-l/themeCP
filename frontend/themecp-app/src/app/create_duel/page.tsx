'use client';

import Navbar from "@/components/Navbar/Navbar";
import LoginPage from "@/pages/LoginPage/LoginPage";
import Contest from "@/pages/Contest/Contest";
import CreateDuel from "@/pages/CreateDuel/CreateDuel";
import PrivateRoute from "@/components/PrivateRoute/PrivateRoute";

export default function Page() {
  return (
    <div>
      <PrivateRoute>
        <Navbar />
        <CreateDuel />
      </PrivateRoute>
    </div>
  );
}