import {
  BarChart3,
  Users,
  Home,
  Calendar,
  CreditCard,
  Star,
  ShieldAlert,
  Settings,
  ShieldCheck,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const isPathActive = (path: string) => {
    return (
      location.pathname === path || location.pathname.startsWith(`${path}/`)
    );
  };

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: BarChart3,
      path: "/admin/dashboard",
    },
    { id: "users", label: "Users", icon: Users, path: "/admin/users" },
    { id: "hostels", label: "Hostels", icon: Home, path: "/admin/hostels" },
    {
      id: "bookings",
      label: "Bookings",
      icon: Calendar,
      path: "/admin/bookings",
    },
    {
      id: "payments",
      label: "Payments",
      icon: CreditCard,
      path: "/admin/payments",
    },
    { id: "reviews", label: "Reviews", icon: Star, path: "/admin/reviews" },
    {
      id: "reports",
      label: "Reports",
      icon: ShieldAlert,
      path: "/admin/reports",
    },
  ];

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success("Logged out successfully");
      navigate("/auth");
    } catch (error: any) {
      toast.error(error.message || "Failed to log out");
    }
  };

  return (
    <div className="flex flex-col h-full w-72 shrink-0 bg-slate-900 overflow-y-auto">
      <div className="px-6 py-6 mb-4 border-b border-slate-800 bg-[linear-gradient(180deg,rgba(249,115,22,0.14),transparent)]">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-500 text-white rounded-lg shadow-[0_0_18px_rgba(249,115,22,0.45)]">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg text-white leading-tight tracking-tight">
              UniNest Uganda
            </span>
            <span className="text-xs text-orange-300 font-medium tracking-wide uppercase">
              Admin Panel
            </span>
          </div>
        </div>
        <p className="mt-4 text-xs text-slate-400 leading-relaxed">
          Engineered for secure operations, moderation, and platform growth.
        </p>
      </div>

      <nav className="flex-1 space-y-1.5 px-4 overflow-y-auto">
        <p className="px-3 pb-2 text-[11px] text-slate-500 font-semibold tracking-[0.12em] uppercase">
          Main Navigation
        </p>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = isPathActive(item.path);

          return (
            <Link
              key={item.id}
              to={item.path}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative",
                isActive
                  ? "bg-orange-500 text-white shadow-md shadow-orange-900/30"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200",
              )}
            >
              {isActive && (
                <span className="absolute left-0 top-2.5 bottom-2.5 w-1 rounded-r-full bg-white/80" />
              )}
              <Icon
                className={cn(
                  "h-5 w-5 transition-colors",
                  isActive
                    ? "text-white"
                    : "text-slate-400 group-hover:text-orange-300",
                )}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-4 mt-auto border-t border-slate-800 space-y-2">
        <p className="px-3 pb-1 text-[11px] text-slate-500 font-semibold tracking-[0.12em] uppercase">
          Preferences
        </p>
        <Link
          to="/admin/settings"
          className={cn(
            "w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 group",
            isPathActive("/admin/settings")
              ? "bg-slate-700 text-white"
              : "text-slate-400 hover:bg-slate-800 hover:text-slate-200",
          )}
        >
          <Settings className="h-5 w-5 text-slate-400 group-hover:text-slate-200" />
          General Settings
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-start gap-3 px-3 py-3 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all duration-200 group"
        >
          <LogOut className="h-5 w-5" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
