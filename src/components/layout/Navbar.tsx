import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-primary">UniNest</span>
        </Link>
        <div className="flex items-center space-x-4">
          <Link to="/search" className="text-sm font-medium hover:text-primary transition-colors">
            Find Hostels
          </Link>
          <Link to="/roommates" className="text-sm font-medium hover:text-primary transition-colors">
            Roommates
          </Link>
          <Link to="/owner/dashboard" className="text-sm font-medium hover:text-primary transition-colors">
            List Property
          </Link>
          <Button className="rounded-full shadow-sm">Sign In</Button>
        </div>
      </div>
    </nav>
  );
}
