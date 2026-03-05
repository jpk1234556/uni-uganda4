import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SearchIcon, MapPin, Wifi, Shield, Zap, Car } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import type { Hostel } from "@/types";
import { Loader2 } from "lucide-react";

const UNIVERSITIES = ["Makerere University", "Kyambogo University", "KIU", "Mbarara University"];
const AMENITIES = [
  { id: "wifi", label: "Free Wi-Fi", icon: Wifi },
  { id: "security", label: "24/7 Security", icon: Shield },
  { id: "power", label: "Backup Generator", icon: Zap },
  { id: "parking", label: "Parking Space", icon: Car },
];

export default function Search() {
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState([500000, 2000000]);
  
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchApprovedHostels();
  }, []);

  const fetchApprovedHostels = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('hostels')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHostels(data || []);
    } catch (error) {
      console.error("Error fetching hostels:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredHostels = hostels.filter(hostel => {
      if (searchTerm && !hostel.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
         (hostel.university && !hostel.university.toLowerCase().includes(searchTerm.toLowerCase()))) {
          return false;
      }
      return true;
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl animate-in fade-in zoom-in-95 duration-500">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Filters Sidebar */}
        <div className="w-full lg:w-1/4 space-y-6">
          <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-white/10">
            <h3 className="font-semibold text-lg mb-4">Filters</h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">University / Area</label>
                <Select>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select University" />
                  </SelectTrigger>
                  <SelectContent>
                    {UNIVERSITIES.map(uni => (
                       <SelectItem key={uni} value={uni}>{uni}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">Price Range (UGX)</label>
                  <span className="text-xs text-muted-foreground">{priceRange[0]/1000}k - {priceRange[1]/1000}k</span>
                </div>
                <Slider
                  defaultValue={[500000, 2000000]}
                  max={3000000}
                  min={300000}
                  step={100000}
                  onValueChange={setPriceRange}
                  className="py-4"
                />
              </div>

              <div className="space-y-3 pt-4 border-t">
                <label className="text-sm font-medium">Amenities</label>
                {AMENITIES.map((amenity) => (
                  <div key={amenity.id} className="flex items-center space-x-2">
                    <Checkbox id={amenity.id} />
                    <label
                      htmlFor={amenity.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
                    >
                      <amenity.icon className="h-4 w-4 text-muted-foreground" />
                      {amenity.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            <Button className="w-full mt-8 bg-gradient-primary text-white hover:opacity-90 shadow-md">Apply Filters</Button>
          </div>
        </div>

        {/* Results Area */}
        <div className="w-full lg:w-3/4">
          <div className="mb-6 flex gap-4">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                placeholder="Search by hostel name or university..." 
                className="pl-10 h-12 text-lg rounded-full shadow-sm bg-white/5 border-white/10 text-white focus-visible:ring-primary"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button className="h-12 px-8 rounded-full shadow-md bg-gradient-primary hover:opacity-90 text-white">Search</Button>
          </div>

          <div className="mb-4">
            <h2 className="text-2xl font-bold">Available Hostels</h2>
            <p className="text-muted-foreground">Showing {filteredHostels.length} approved properties</p>
          </div>

          {isLoading ? (
            <div className="py-20 flex justify-center items-center flex-col gap-4">
               <Loader2 className="h-10 w-10 animate-spin text-primary" />
               <p className="text-muted-foreground">Fetching live availability...</p>
            </div>
          ) : filteredHostels.length === 0 ? (
             <div className="text-center py-20 border border-dashed rounded-xl bg-muted/20">
                <p className="text-muted-foreground text-lg">No properties match your current filters.</p>
             </div>
          ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredHostels.map((hostel) => (
                <Link to={`/hostel/${hostel.id}`} key={hostel.id}>
                    <Card className="overflow-hidden bg-white/5 hover:bg-white/10 border-white/10 hover:border-primary/50 transition-all duration-300 group cursor-pointer shadow-xl">
                    <div className="aspect-[4/3] relative overflow-hidden bg-muted">
                        <img 
                            src={hostel.images?.[0] || `https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=800`} 
                            alt={hostel.name}
                            className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold shadow-sm">
                        {hostel.price_range || "Contact for price"}
                        </div>
                    </div>
                    <CardContent className="p-5">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-xl text-white group-hover:text-primary transition-colors line-clamp-1">{hostel.name}</h3>
                        </div>
                        <div className="flex items-center text-muted-foreground mb-4 text-sm">
                            <MapPin className="h-4 w-4 mr-1 shrink-0" />
                            <span className="line-clamp-1">{hostel.address || hostel.university}</span>
                        </div>
                        <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
                           {hostel.amenities?.slice(0, 3).map((amenity, i) => (
                             <span key={i} className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-md whitespace-nowrap">{amenity}</span>
                           )) || <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-md">Basic Amenities</span>}
                        </div>
                    </CardContent>
                    </Card>
                </Link>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
