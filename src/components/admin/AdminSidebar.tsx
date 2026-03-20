import { 
  BarChart3, 
  Users, 
  Home, 
  Calendar, 
  CreditCard, 
  Star, 
  ShieldAlert, 
  Settings,
  ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function AdminSidebar({ activeTab, onTabChange }: AdminSidebarProps) {
  const menuItems = [
    { id: "overview", label: "Dashboard", icon: BarChart3 },
    { id: "users", label: "Users", icon: Users },
    { id: "hostels", label: "Hostels", icon: Home },
    { id: "bookings", label: "Bookings", icon: Calendar },
    { id: "payments", label: "Payments", icon: CreditCard },
    { id: "reviews", label: "Reviews", icon: Star },
    { id: "reports", label: "Reports", icon: ShieldAlert },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="flex flex-col h-full w-full py-6">
      <div className="px-6 mb-8 flex items-center gap-3">
        <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg shadow-[0_0_15px_rgba(99,102,241,0.2)]">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-lg text-white leading-tight">Super Admin</span>
          <span className="text-xs text-indigo-400 font-medium">Control Center</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1.5 px-3">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                isActive 
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-900/20" 
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              )}
            >
              <Icon className={cn("h-4 w-4", isActive ? "text-white" : "text-slate-400")} />
              {item.label}
            </button>
          );
        })}
      </nav>
      
      {/* Decorative footer element in sidebar */}
      <div className="px-6 mt-auto">
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
          <p className="text-xs text-slate-400 leading-relaxed">
            UniNest Uganda<br/>
            Engineered for Scale
          </p>
        </div>
      </div>
    </div>
  );
}
