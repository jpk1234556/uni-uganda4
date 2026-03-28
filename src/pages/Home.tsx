import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import type { Hostel } from "@/types";
import { motion } from "framer-motion";
import { 
  MapPin, 
  Search, 
  Building2, 
  Users, 
  Star, 
  ShieldCheck, 
  Clock, 
  CheckCircle2,
  Home as HomeIcon,
  Quote,
  Loader2
} from "lucide-react";

// --- Framer Motion Variants ---
const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.7 }
};

const staggerContainer = {
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  viewport: { once: true, margin: "-100px" },
  transition: { staggerChildren: 0.15 }
};

const itemAnim = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

export default function Home() {
  const [topHostels, setTopHostels] = useState<Hostel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTopHostels();
  }, []);

  const fetchTopHostels = async () => {
    try {
      setIsLoading(true);
      // Fetch up to 3 approved hostels, ordered by rating descending (if the column exists)
      // Note: If rating column hasn't been added yet, this might throw, so we catch it
      const { data, error } = await supabase
        .from('hostels')
        .select('*')
        .eq('status', 'approved')
        .order('rating', { ascending: false, nullsFirst: false })
        .limit(3);

      if (error) {
        // Fallback: If rating column doesn't exist yet, just fetch any 3 approved
        console.warn("Rating order failed (likely column missing), falling back to standard fetch", error);
        const fallback = await supabase
          .from('hostels')
          .select('*')
          .eq('status', 'approved')
          .limit(3);
        setTopHostels(fallback.data || []);
      } else {
        setTopHostels(data || []);
      }
    } catch (error) {
      console.error("Error fetching top hostels:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative min-h-[600px] flex items-center justify-center overflow-hidden bg-pattern-dark"
      >
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=2000"
            alt="Hostel"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 to-slate-800/90" />
        <div className="container relative z-20 text-center text-white px-4">
          <motion.div
            variants={fadeInUp}
            className="max-w-4xl mx-auto"
          >
            <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight mb-6">
              Find Your Perfect <span className="text-gradient-primary">Student Home</span> in Uganda
            </h1>
            <p className="text-lg md:text-xl mb-8 max-w-3xl mx-auto text-slate-300 leading-relaxed">
              Discover verified hostels near your university. Safe, affordable, and convenient living for students.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/search">
                <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-3 bg-gradient-primary hover:opacity-90 shadow-lg">
                  <Search className="mr-2 h-5 w-5" />
                  Start Searching
                </Button>
              </Link>
              <Link to="/auth?mode=signup">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto text-lg px-8 py-3 bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20">
                  Register as Student
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="container mx-auto px-4 py-16"
      >
        <motion.div 
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.h2 
            variants={fadeInUp}
            className="text-4xl font-bold mb-4"
          >
            Why Choose <span className="text-gradient-primary">Uni-Nest</span>?
          </motion.h2>
          <motion.p 
            variants={fadeInUp}
            className="text-muted-foreground text-lg max-w-2xl mx-auto mb-12"
          >
            We make finding a hostel simple, secure, and tailored for Ugandan students.
          </motion.p>
        </motion.div>

        <motion.div 
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {[
            {
              icon: ShieldCheck,
              title: "Verified Properties",
              description: "All hostels are manually verified for safety and quality standards."
            },
            {
              icon: MapPin,
              title: "Prime Locations",
              description: "Strategic locations near major universities across Uganda."
            },
            {
              icon: Star,
              title: "Real Reviews",
              description: "Authentic reviews from real students to help you choose."
            }
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={itemAnim}
              custom={index}
              className="p-8 rounded-2xl bg-card text-card-foreground shadow-lg border border-border hover:shadow-xl transition-all duration-300"
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <feature.icon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* Top Hostels Section */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <motion.div 
            variants={fadeInUp}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Featured <span className="text-gradient-primary">Hostels</span></h2>
            <p className="text-muted-foreground">Discover top-rated student accommodations</p>
          </motion.div>

          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-muted-foreground ml-3">Fetching featured hostels...</p>
            </div>
          ) : topHostels.length === 0 ? (
            <div className="text-center py-20 border border-dashed rounded-2xl bg-muted/20">
              <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">No featured hostels available yet.</p>
              <p className="text-muted-foreground">Check back soon for updated listings!</p>
            </div>
          ) : (
            <motion.div 
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {topHostels.map((hostel, index) => (
                <motion.div
                  key={hostel.id}
                  variants={itemAnim}
                  custom={index}
                  whileHover={{ scale: 1.02 }}
                  className="group"
                >
                  <Link to={`/hostel/${hostel.id}`} className="block">
                    <div className="bg-card rounded-2xl overflow-hidden shadow-lg border border-border hover:shadow-xl transition-all duration-300">
                      <div className="aspect-[4/3] relative overflow-hidden bg-muted">
                        {hostel.images && hostel.images.length > 0 ? (
                          <img
                            src={hostel.images[0]}
                            alt={hostel.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/40">
                            <Building2 className="h-16 w-16 text-primary/60" />
                          </div>
                        )}
                        <div className="absolute top-4 left-4 flex gap-2">
                          {index === 0 && (
                            <span className="bg-amber-400 text-slate-900 text-xs font-bold px-3 py-1 rounded-md shadow-sm">Featured</span>
                          )}
                          <span className="bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-md shadow-sm flex items-center gap-1">
                            <ShieldCheck className="h-3 w-3" />
                            Verified
                          </span>
                        </div>
                        <div className="absolute bottom-4 right-4 bg-slate-900/90 backdrop-blur-md text-white px-4 py-2 rounded-xl shadow-lg border border-white/10">
                          <div className="text-xs text-slate-300 font-medium">From</div>
                          <div className="text-lg font-bold">UGX {hostel.price_range?.split('-')[0] || '150K'}</div>
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-xl font-bold text-card-foreground group-hover:text-primary transition-colors">
                            {hostel.name}
                          </h3>
                          <div className="flex items-center gap-2">
                            {hostel.rating && (
                              <div className="flex items-center">
                                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                                <span className="ml-1 text-sm font-medium">{hostel.rating.toFixed(1)}</span>
                              </div>
                            )}
                            {hostel.university && (
                              <span className="text-sm text-muted-foreground bg-muted/80 px-2 py-1 rounded">
                                {hostel.university}
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                          {hostel.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-muted-foreground">
                            <MapPin className="h-4 w-4 mr-1" />
                            <span className="text-sm">{hostel.address}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {hostel.amenities?.includes('WiFi') ? 'WiFi' : 'Available'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}
