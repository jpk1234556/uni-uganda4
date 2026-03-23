import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Overview from "./components/admin/Overview";
import UsersManager from "./components/admin/UsersManager";
import HostelsManager from "./components/admin/HostelsManager";
import PaymentsManager from "./components/admin/PaymentsManager";
import ReviewsManager from "./components/admin/ReviewsManager";
import ReportsManager from "./components/admin/ReportsManager";
import AdminSidebar from "./components/admin/AdminSidebar";
import Auth from "@/pages/Auth";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import { AuthProvider } from "@/context/AuthContext";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/auth" element={<Auth appType="admin" />} />
          
          {/* Admin Dashboard with Sidebar Layout */}
          <Route 
            path="/admin/*" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <div className="flex h-screen bg-slate-100 overflow-hidden">
                  <AdminSidebar />
                  <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    <Routes>
                      <Route path="dashboard" element={<Overview />} />
                      <Route path="users" element={<UsersManager />} />
                      <Route path="hostels" element={<HostelsManager />} />
                      <Route path="payments" element={<PaymentsManager />} />
                      <Route path="reviews" element={<ReviewsManager />} />
                      <Route path="reports" element={<ReportsManager />} />
                      <Route path="*" element={<Navigate to="dashboard" replace />} />
                    </Routes>
                  </main>
                </div>
              </ProtectedRoute>
            } 
          />
          
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
