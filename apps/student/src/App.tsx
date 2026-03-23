import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const Home = lazy(() => import("./pages/Home"));
const Search = lazy(() => import("./pages/Search"));
const HostelDetail = lazy(() => import("./pages/HostelDetail"));
const StudentDashboard = lazy(() => import("./pages/StudentDashboard"));
const Auth = lazy(() => import("@/pages/Auth"));

import { BrowserRouter } from "react-router-dom";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <Suspense
              fallback={
                <div className="container mx-auto px-4 py-16 text-center text-slate-500">
                  Loading page...
                </div>
              }
            >
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/search" element={<Search />} />
                <Route path="/hostel/:id" element={<HostelDetail />} />
                <Route 
                  path="/student/dashboard" 
                  element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} 
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
