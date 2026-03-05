import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, Shield, Wifi, Zap, Users, Loader2, ArrowLeft, Map } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Hostel, RoomType } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export default function HostelDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [hostel, setHostel] = useState<Hostel | null>(null);
  const [rooms, setRooms] = useState<RoomType[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    if (id) {
      fetchHostelDetails(id);
    }
  }, [id]);

  const fetchHostelDetails = async (hostelId: string) => {
    try {
      setIsLoading(true);
      
      // Fetch Hostel
      const { data: hostelData, error: hostelError } = await supabase
        .from('hostels')
        .select('*')
        .eq('id', hostelId)
        .single();

      if (hostelError) throw hostelError;
      setHostel(hostelData);

      // Fetch Room Types
      const { data: roomsData, error: roomsError } = await supabase
        .from('room_types')
        .select('*')
        .eq('hostel_id', hostelId);

      if (roomsError) throw roomsError;
      setRooms(roomsData || []);
      
      if (roomsData && roomsData.length > 0) {
          setSelectedRoom(roomsData[0].id);
      }

    } catch (error) {
      console.error("Error fetching detail:", error);
      toast.error("Hostel not found");
      navigate("/search");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!user) {
      toast.info("Please login as a student to book a room");
      navigate("/auth");
      return;
    }
    if (!selectedRoom) return;

    try {
      setIsBooking(true);
      const { error } = await supabase
        .from('bookings')
        .insert({
          student_id: user.id,
          hostel_id: hostel?.id,
          room_type_id: selectedRoom,
          status: "pending"
        });

      if (error) throw error;
      
      toast.success("Booking request submitted! The owner will review it shortly.");
      navigate("/student/dashboard");
      
    } catch (error: any) {
      toast.error(error.message || "Failed to submit booking");
    } finally {
      setIsBooking(false);
    }
  };

  if (isLoading) {
    return <div className="min-h-[70vh] flex flex-col items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /><p className="mt-4 text-muted-foreground">Loading details...</p></div>;
  }

  if (!hostel) return null;

  return (
    <div className="container mx-auto px-4 py-8 animate-in fade-in duration-500 max-w-6xl">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 -ml-4 gap-2">
         <ArrowLeft className="h-4 w-4" /> Back to Search
      </Button>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content */}
        <div className="w-full lg:w-2/3 space-y-8">
          
          <div className="space-y-4">
             <div className="flex justify-between items-start">
               <div>
                  <h1 className="text-4xl font-extrabold tracking-tight">{hostel.name}</h1>
                  <div className="flex items-center text-muted-foreground mt-2 text-lg">
                      <MapPin className="h-5 w-5 mr-1" />
                      {hostel.address || hostel.university}
                  </div>
               </div>
               <Badge variant="secondary" className="text-lg py-1 px-3">
                 <Star className="h-4 w-4 mr-1 text-yellow-500 fill-yellow-500" />
                 4.8
               </Badge>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-2 h-[40vh] md:h-[50vh] rounded-3xl overflow-hidden mt-6">
            <div className="col-span-2 md:col-span-1 h-full">
              <img 
                src={hostel.images?.[0] || "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=1200"} 
                alt="Main" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" 
              />
            </div>
            <div className="hidden md:grid grid-cols-1 grid-rows-2 gap-2 h-full">
              <img 
                src={hostel.images?.[1] || "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&q=80&w=800"} 
                alt="Room" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" 
              />
              <img 
                 src={hostel.images?.[2] || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800"} 
                 alt="Facility" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" 
              />
            </div>
          </div>

          <div className="space-y-6 bg-card/50 p-6 rounded-2xl border border-primary/10 glass">
            <h2 className="text-2xl font-bold">About this property</h2>
            <p className="text-muted-foreground leading-relaxed text-lg">
              {hostel.description || "A premium student accommodation featuring all the modern amenities you need to excel in your studies while living comfortably."}
            </p>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Amenities</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {[
                  { name: "Free Hi-Speed Wi-Fi", icon: Wifi },
                  { name: "24/7 Security guarding", icon: Shield },
                  { name: "Backup Generator", icon: Zap },
                  { name: "Study Rooms", icon: Users }
                ].map((amenity, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl border bg-muted/30">
                       <div className="p-2 bg-primary/10 rounded-lg text-primary">
                          <amenity.icon className="h-5 w-5" />
                       </div>
                       <span className="font-medium">{amenity.name}</span>
                    </div>
                ))}
            </div>
          </div>

          {/* Location / Google Maps */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Map className="h-6 w-6 text-primary" /> Location
            </h2>
            <div className="w-full h-[400px] rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-50 relative">
               {!import.meta.env.VITE_GOOGLE_MAPS_API_KEY && (
                 <div className="absolute inset-0 flex items-center justify-center bg-slate-100/80 backdrop-blur-sm z-10 p-6 text-center">
                    <div className="bg-white p-4 rounded-xl shadow-md border border-slate-200">
                      <MapPin className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm font-medium text-slate-700">Map unavailable</p>
                      <p className="text-xs text-slate-500 mt-1">VITE_GOOGLE_MAPS_API_KEY is missing in .env.local</p>
                    </div>
                 </div>
               )}
               <iframe
                 width="100%"
                 height="100%"
                 style={{ border: 0 }}
                 loading="lazy"
                 allowFullScreen
                 referrerPolicy="no-referrer-when-downgrade"
                 src={`https://www.google.com/maps/embed/v1/place?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''}&q=${encodeURIComponent(hostel.address || `${hostel.name} ${hostel.university} Uganda`)}&zoom=15`}
               ></iframe>
            </div>
            <p className="text-sm text-muted-foreground flex items-start gap-2">
               <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
               {hostel.address || `${hostel.name}, Near ${hostel.university}`}
            </p>
          </div>

        </div>

        {/* Sticky Booking Widget */}
        <div className="w-full lg:w-1/3">
          <div className="sticky top-24">
            <Card className="shadow-2xl border-primary/20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
              <CardContent className="p-6 space-y-6">
                <div className="pb-4 border-b">
                  <span className="text-3xl font-extrabold">{hostel.price_range || "Contact"}</span>
                  <span className="text-muted-foreground"> / semester</span>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Select Room Type</h3>
                  {rooms.length === 0 ? (
                      <p className="text-sm border rounded-lg p-3 bg-muted/50 text-muted-foreground">No specific room types listed. Contact owner directly.</p>
                  ) : (
                    <div className="grid gap-3">
                        {rooms.map((room) => (
                        <div 
                            key={room.id}
                            onClick={() => setSelectedRoom(room.id)}
                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            selectedRoom === room.id 
                                ? "border-primary bg-primary/5 shadow-sm" 
                                : "border-border hover:border-primary/50"
                            }`}
                        >
                            <div className="flex justify-between items-center font-medium mb-1">
                                <span>{room.name}</span>
                                <span>{room.price.toLocaleString()} UGX</span>
                            </div>
                            <div className="text-sm text-muted-foreground flex justify-between">
                               <span>Capacity: {room.capacity}</span>
                               <span className={room.available > 0 ? "text-green-600" : "text-destructive"}>
                                  {room.available > 0 ? `${room.available} Left` : "Full"}
                               </span>
                            </div>
                        </div>
                        ))}
                    </div>
                  )}
                </div>

                <div className="pt-4">
                  <Button 
                    className="w-full h-14 text-lg rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all" 
                    size="lg"
                    onClick={handleBooking}
                    disabled={isBooking || (rooms.length > 0 && !selectedRoom)}
                  >
                    {isBooking ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                    Request to Book
                  </Button>
                  <p className="text-center text-xs text-muted-foreground mt-4">
                    You won't be charged yet. The owner will review your application.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

      </div>
    </div>
  );
}
