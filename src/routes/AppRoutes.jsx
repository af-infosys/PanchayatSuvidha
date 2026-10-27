import { Routes, Route } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";

import ProtectedRoute from "./ProtectedRoute";
import Login from "../auth/Login";
import { useAuth } from "../config/AuthContext";
import NotFound from "../components/NotFound";
import TaxRegister from "../features/waterTax/TaxRegister";
import TaxEntryForm from "../features/waterTax/TaxEntryForm";
import DownloadReceipt from "../features/reciept/DownloadReceipt";
import TarijReport from "../features/waterTax/TarijReport";
import ManageTax from "../features/waterTax/ManageTax";
import IndexReport from "../features/waterTax/IndexReport";

export default function AppRoutes() {
  // const { user } = useAuth();

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
          <Route path="taxentry" element={<ManageTax />} />
          <Route path="taxentry/:mId" element={<TaxEntryForm />} />
          {/* <Route path="receipt/add/:mId" element={<TaxEntryForm />} /> */}
          <Route path="receipt/download/:mId" element={<DownloadReceipt />} />

          <Route path="taxregister" element={<TaxRegister />} />
          <Route path="indexreport" element={<IndexReport />} />
          <Route path="tarijreport" element={<TarijReport />} />
        </Route>
      </Route>

      <Route path="/login" element={<Login />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
