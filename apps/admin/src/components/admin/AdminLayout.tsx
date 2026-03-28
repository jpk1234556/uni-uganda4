import { useState, type ReactNode } from "react";
import { Menu, X } from "lucide-react";
import { useLocation } from "react-router-dom";

interface AdminLayoutProps {
  sidebar: ReactNode;
  children: ReactNode;
}

export default function AdminLayout({ sidebar, children }: AdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const pageTitleMap: Record<string, string> = {
    dashboard: "Dashboard",
    users: "User Management",
    hostels: "Hostels",
    bookings: "Bookings",
    payments: "Payments",
    reviews: "Reviews",
    reports: "Reports",
    settings: "Settings",
  };

  const activeKey =
    location.pathname.split("/").filter(Boolean)[1] || "dashboard";
  const activeTitle = pageTitleMap[activeKey] || "Admin";

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-slate-100 overflow-hidden relative">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_0%,rgba(249,115,22,0.12),transparent_35%),radial-gradient(circle_at_100%_100%,rgba(15,23,42,0.08),transparent_35%)]" />

      {/* Mobile Sidebar Toggle Header */}
      <div className="md:hidden absolute top-0 left-0 right-0 h-14 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm flex items-center px-4 z-20">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 -ml-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <Menu className="h-6 w-6" />
        </button>
        <div className="ml-2">
          <p className="text-xs uppercase tracking-[0.14em] text-slate-400 font-semibold">
            UniNest Admin
          </p>
          <p className="font-bold text-slate-900 leading-tight">
            {activeTitle}
          </p>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 top-16 bg-black/60 backdrop-blur-sm z-30 md:hidden animate-in fade-in duration-200"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar (Fixed on Desktop, Absolute on Mobile) */}
      <div
        className={`
        fixed md:static inset-y-0 left-0 z-40 transform 
        ${isSidebarOpen ? "translate-x-0 pt-0" : "-translate-x-full"}
        md:translate-x-0 transition-transform duration-300 ease-out shadow-xl md:shadow-none
        w-72 flex-shrink-0 bg-[#0B1120] text-slate-300 border-r border-slate-800 flex flex-col h-full overflow-y-auto custom-scrollbar top-16 md:top-0
      `}
      >
        <div className="md:hidden flex justify-between items-center p-4 border-b border-slate-800/50 bg-[#0B1120] sticky top-0 z-10">
          <span className="text-sm font-bold text-white uppercase tracking-wider">
            Menu
          </span>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="text-slate-400 hover:text-white bg-slate-800/50 p-1.5 rounded-md transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div
          onClick={() => {
            if (window.innerWidth < 768) setIsSidebarOpen(false);
          }}
        >
          {sidebar}
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-transparent flex flex-col relative w-full custom-scrollbar pt-14 md:pt-0">
        <div className="hidden md:flex sticky top-0 z-10 h-16 px-8 bg-white/80 backdrop-blur border-b border-slate-200 items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-slate-400 font-semibold">
              Control Center
            </p>
            <h1 className="text-lg font-bold text-slate-900 leading-tight">
              {activeTitle}
            </h1>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400 font-medium">Today</p>
            <p className="text-sm text-slate-700 font-semibold">
              {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}
