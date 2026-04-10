import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "@/components/ui/sonner";

const OwnerDashboard = lazy(() => import("./pages/OwnerDashboard"));
const Auth = lazy(() => import("@/pages/Auth"));
const Navbar = lazy(() => import("@/components/layout/Navbar"));

export default function App() {
  const fallback = (
    <div className="min-h-[40vh] flex items-center justify-center text-slate-500 text-sm">
      Loading...
    </div>
  );

  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={fallback}>
          <div className="flex flex-col min-h-screen bg-slate-50">
            <Navbar appType="owner" />
            <main className="flex-grow">
              <Routes>
                <Route
                  path="/"
                  element={<Navigate to="/owner/dashboard" replace />}
                />
                <Route path="/auth" element={<Auth appType="owner" />} />
                <Route
                  path="/owner/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={["hostel_owner"]}>
                      <OwnerDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="*"
                  element={<Navigate to="/owner/dashboard" replace />}
                />
              </Routes>
            </main>
          </div>
        </Suspense>
        <Toaster />
      </AuthProvider>
    </BrowserRouter>
  );
}
