import { Routes, Route } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";

import ProtectedRoute from "./ProtectedRoute";
import Login from "../auth/Login";
import { useAuth } from "../config/AuthContext";
import NotFound from "../components/NotFound";
import TaxRegister from "../features/waterTax/TaxRegister";
import TaxEntryForm from "../features/waterTax/TaxEntryForm";

export default function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route
        path="/"
        element={
          <ProtectedRoute allowedRoles={["sarpanch"]}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<></>} />

        <Route path="water">
          <Route path="taxentry" element={<TaxRegister />} />
          <Route path="taxentry/:mId" element={<TaxEntryForm />} />
        </Route>
      </Route>

      <Route path="/login" element={<Login />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
