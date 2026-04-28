import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import { AuthProvider } from "@/context/AuthContext";

const Home = lazy(() => import("@/pages/Home"));
const Search = lazy(() => import("@/pages/Search"));
const Faq = lazy(() => import("@/pages/Faq"));
const Roommates = lazy(() => import("@/pages/Roommates"));
const HostelDetail = lazy(() => import("@/pages/HostelDetail"));
const Auth = lazy(() => import("@/pages/Auth"));
const OwnerDashboard = lazy(() => import("@/pages/OwnerDashboard"));
const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));
const StudentDashboard = lazy(() => import("@/pages/StudentDashboard"));
const VerifyEmail = lazy(() => import("@/pages/VerifyEmail"));
const ForgotPassword = lazy(() => import("@/pages/ForgotPassword"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));

const routeFallback = (
  <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
    Loading page...
  </div>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="flex min-h-screen flex-col bg-background text-foreground animate-in fade-in duration-500">
          <Navbar />
          <main className="flex-1">
            <Suspense fallback={routeFallback}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/search" element={<Search />} />
                <Route path="/faq" element={<Faq />} />
                <Route path="/roommates" element={<Roommates />} />
                <Route path="/hostel/:id" element={<HostelDetail />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                {/* Protected Routes */}
                <Route
                  path="/student/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={["student"]}>
                      <StudentDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/owner/dashboard"
                  element={
                    <ProtectedRoute
                      allowedRoles={["hostel_owner", "super_admin"]}
                    >
                      <OwnerDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={["super_admin"]}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </Suspense>
          </main>
          <Footer />
        </div>
        <Toaster />
      </AuthProvider>
    </Router>
  );
}

export default App;
