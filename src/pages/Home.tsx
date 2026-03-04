import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl animate-in fade-in zoom-in-95 duration-500">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary/10 via-background to-secondary/30 border border-primary/10 shadow-xl py-24 md:py-36 rounded-3xl mb-16 text-center px-4 overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 -left-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl opacity-60 pointer-events-none" />
        <div className="absolute bottom-0 -right-20 w-96 h-96 bg-secondary/30 rounded-full blur-3xl opacity-60 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-primary/5 rounded-full blur-3xl opacity-50 pointer-events-none" />
        
        <div className="relative z-10 max-w-4xl mx-auto space-y-6">
          <Badge className="px-4 py-1 text-sm bg-primary/20 text-primary hover:bg-primary/30 border-none mb-4">
            Uganda's #1 Student Accommodation Hub
          </Badge>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
            Welcome to <span className="text-primary">UniNest</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-[600px] mx-auto">
            The smart, secure hostel allocation platform for university students. Find your perfect space today.
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
            <select className="p-3 border border-border rounded-full shadow-sm focus:ring-primary focus:border-primary w-full md:w-auto text-lg bg-background">
              <option>Select University</option>
              <option>Makerere University</option>
              <option>Kyambogo University</option>
              <option>Uganda Christian University</option>
              <option>Kampala University</option>
              <option>Gulu University</option>
              <option>Busitema University</option>
              <option>Ndejje University</option>
              <option>Islamic University in Uganda</option>
              <option>KIU</option>
              <option>Mbarara University</option>
            </select>
            <Link to="/search">
              <Button size="lg" className="w-full h-12 text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all rounded-full">Search Hostels</Button>
            </Link>
          </div>
          <div className="flex gap-4 justify-center mt-8">
            <Link to="/owner/dashboard">
              <Button size="lg" variant="outline" className="rounded-full hover:scale-105 transition-transform glass">List your Property</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
