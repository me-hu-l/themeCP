import Navbar from "@/components/Navbar/Navbar";
import LoginPage from "@/pages/LoginPage/LoginPage";
import Contest from "@/pages/Contest/Contest";
import PrivateRoute from "@/components/PrivateRoute/PrivateRoute";

export default function Page() {
  return (
    <div>
      <PrivateRoute>
        <Navbar />
        <Contest />
      </PrivateRoute>
    </div>
  );
}