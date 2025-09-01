'use client'

import Home from "@/pages/Home/Home";
import Navbar from "@/components/Navbar/Navbar";
import Level_Sheet from "@/pages/Level_Sheet/Level_Sheet";
import ImportExport from "@/components/ImportExport/ImportExport";
import { useProfile } from "@/context/ProfileContext/ProfileContext";
import { useParams } from "next/dist/client/components/navigation";
import SubNavbar from "@/components/SubNavbar/SubNavbar";

export default function Page() {

  const { user_profile } = useProfile();
  const params = useParams();
  const id = params?.id || user_profile.id; // Fallback to a default userId if not provided
  return <div>
    <Navbar />
    {/* <Home /> */}
    <SubNavbar active={[false, false, false, true, false, false]} id={id} />
    <ImportExport id={id} />
    {/* <Level_Sheet /> */}
  </div>
}
