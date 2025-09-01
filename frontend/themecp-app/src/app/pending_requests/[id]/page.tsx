'use client'

import Navbar from "@/components/Navbar/Navbar";
import PrivateRoute from "@/components/PrivateRoute/PrivateRoute";
import SubNavbar from "@/components/SubNavbar/SubNavbar";
import ContestHistory from "@/pages/Profile/ContestHistory";
import PendingRequests from "@/pages/Profile/PendingRequests";
import { useParams } from "next/navigation";
import { useProfile } from "@/context/ProfileContext/ProfileContext";
export default function Page() {

    const { user_profile } = useProfile();
  const params= useParams();
  const id = params?.id || user_profile.id;
  // Fallback to a default userId if not provided
  return (
    <div>
        <PrivateRoute>
                <Navbar />
                <SubNavbar active={[false, false, false,false, false,true]} id={id}/>
                <PendingRequests id={id}/>
        </PrivateRoute>
    </div>
  );
}