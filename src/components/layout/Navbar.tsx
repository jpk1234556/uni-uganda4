import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { Building2, Search, User, ChevronDown } from "lucide-react";

export default function Navbar() {
  const { user, dbUser, signOut } = useAuth();
  
  return (
    <nav className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-slate-200 transition-all duration-300 shadow-sm">
      <div className="container mx-auto flex h-20 items-center justify-between px-4 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 mr-8">
          <div className="bg-gradient-primary p-1.5 rounded-lg flex items-center justify-center">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold text-slate-900 tracking-tight">Hostel<span className="font-normal text-slate-500">Uganda</span></span>
        </Link>
        
        {/* Links - Hidden on Mobile */}
        <div className="hidden lg:flex items-center space-x-8 text-sm font-medium text-slate-600">
          <button className="flex items-center gap-1 hover:text-slate-900 transition-colors">
            Universities <ChevronDown className="h-4 w-4" />
          </button>
          <Link to="/search" className="hover:text-slate-900 transition-colors">
            Browse Hostels
          </Link>
          <Link to="/owner/dashboard" className="hover:text-slate-900 transition-colors">
            List Your Hostel
          </Link>
        </div>

        {/* Right Side Search & Auth */}
        <div className="flex items-center space-x-4 ml-auto">
          {/* Search Input - Hidden on mobile */}
          <div className="hidden md:flex relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search hostels..." 
              className="pl-9 bg-slate-50 border-slate-200 text-slate-900 rounded-full h-10 focus-visible:ring-1 focus-visible:ring-primary transition-all shadow-none"
            />
          </div>

          {user ? (
             <div className="flex items-center gap-4">
              <span className="text-sm text-slate-600 hidden md:inline-block">
                {dbUser ? `Hi, ${dbUser.first_name}` : ""}
              </span>
              <Button onClick={signOut} variant="outline" className="rounded-full shadow-sm border-slate-200 text-slate-700 hover:bg-slate-50">Sign Out</Button>
            </div>
          ) : (
            <Link to="/auth">
              <Button variant="outline" className="rounded-full shadow-sm border-slate-200 bg-white hover:bg-slate-50 text-slate-700 gap-2">
                <User className="h-4 w-4" /> Student Login
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
