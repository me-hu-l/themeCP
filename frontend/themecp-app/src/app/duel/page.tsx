import Navbar from "@/components/Navbar/Navbar";
import LoginPage from "@/pages/LoginPage/LoginPage";
// import Contest from "@/pages/Contest/Contest";
import PendingDuels from "@/pages/PendingDuels/PendingDuels";
import PrivateRoute from "@/components/PrivateRoute/PrivateRoute";

export default function Page() {
  return (
    <div>
        <PrivateRoute>
                <Navbar />
                <PendingDuels />
        </PrivateRoute>
    </div>
  );
}