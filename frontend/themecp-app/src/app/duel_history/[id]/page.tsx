'use client'

import Navbar from "@/components/Navbar/Navbar";
import PrivateRoute from "@/components/PrivateRoute/PrivateRoute";
import SubNavbar from "@/components/SubNavbar/SubNavbar";
import ContestHistory from "@/pages/Profile/ContestHistory";
import { useParams } from "next/navigation";
import { useProfile } from "@/context/ProfileContext/ProfileContext";
import DuelHistory from "@/pages/DuelHistory/DuelHistory";
export default function Page() {

    const { user_profile } = useProfile();
  const params= useParams();
  const id = params?.id || user_profile.id;
  // Fallback to a default userId if not provided
  return (
    <div>
        {/* <PrivateRoute> */}
                <Navbar />
                <SubNavbar active={[false,false, true, false,false,false]} id={id}/>
                <DuelHistory id={id}/>
    </div>
  );
}