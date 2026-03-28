import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Loader2,
  AlertCircle,
  Building,
  Users,
  Calendar,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Clock3,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function Overview() {
  const [metrics, setMetrics] = useState({
    totalStudents: 0,
    totalOwners: 0,
    activeHostels: 0,
    pendingVerifications: 0,
    activeBookings: 0,
  });
  const [recentHostels, setRecentHostels] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);

  useEffect(() => {
    fetchMetrics();

    // Real-time subscriptions
    const usersSub = supabase
      .channel("admin:users")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "users" },
        fetchMetrics,
      )
      .subscribe();

    const hostelsSub = supabase
      .channel("admin:hostels")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "hostels" },
        fetchMetrics,
      )
      .subscribe();

    const bookingsSub = supabase
      .channel("admin:bookings")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookings" },
        fetchMetrics,
      )
      .subscribe();

    return () => {
      supabase.removeChannel(usersSub);
      supabase.removeChannel(hostelsSub);
      supabase.removeChannel(bookingsSub);
    };
  }, []);

  const fetchMetrics = async () => {
    try {
      setIsLoading(true);

      const { data: usersCount, error: usersErr } = await supabase
        .from("users")
        .select("role");
      const { data: hostelsData, error: hostelsErr } = await supabase
        .from("hostels")
        .select(
          "id, name, university, status, created_at, users!hostels_owner_id_fkey(first_name, last_name)",
        )
        .order("created_at", { ascending: false });
      const { count: bookingsCount, error: bookingsErr } = await supabase
        .from("bookings")
        .select("*", { count: "exact", head: true })
        .eq("status", "approved");

      if (usersErr || hostelsErr || bookingsErr)
        throw new Error("Failed to load metrics");

      const studentCount =
        usersCount?.filter((u: any) => u.role === "student").length || 0;
      const ownerCount =
        usersCount?.filter((u: any) => u.role === "hostel_owner").length || 0;
      const activeHostels =
        hostelsData?.filter((h: any) => h.status === "approved").length || 0;
      const pendingHostels =
        hostelsData?.filter((h: any) => h.status === "pending").length || 0;

      setMetrics({
        totalStudents: studentCount,
        totalOwners: ownerCount,
        activeHostels,
        pendingVerifications: pendingHostels,
        activeBookings: bookingsCount || 0,
      });

      setRecentHostels(hostelsData?.slice(0, 5) || []);
      setLastUpdatedAt(new Date());
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-orange-700 px-6 py-6 md:px-8 md:py-8 shadow-xl shadow-slate-300/40">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] font-semibold text-orange-200">
              Super Admin Control Center
            </p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white mt-2">
              Dashboard Overview
            </h2>
            <p className="text-slate-200 mt-2 max-w-2xl">
              Track platform health in real time, escalate moderation faster,
              and keep hostel onboarding under control.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/admin/hostels"
              className="inline-flex items-center rounded-lg bg-white/95 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-white transition-colors"
            >
              Review Hostels
            </Link>
            <Link
              to="/admin/users"
              className="inline-flex items-center rounded-lg border border-white/30 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
            >
              Manage Users
            </Link>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 text-slate-600">
          <Clock3 className="h-4 w-4 text-orange-500" />
          {lastUpdatedAt
            ? `Last synced ${lastUpdatedAt.toLocaleTimeString()}`
            : "Fetching latest data..."}
        </div>
        <div className="text-slate-500">
          Live metrics from users, hostels and bookings
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatsCard
          title="Total Platform Users"
          value={metrics.totalStudents + metrics.totalOwners}
          loading={isLoading}
          icon={<Users className="h-5 w-5 text-indigo-500" />}
          gradient="from-indigo-500 to-blue-600"
          delay={0.1}
        />
        <StatsCard
          title="Active Hostels"
          value={metrics.activeHostels}
          loading={isLoading}
          icon={<Building className="h-5 w-5 text-emerald-500" />}
          gradient="from-emerald-500 to-teal-600"
          delay={0.2}
        />
        <StatsCard
          title="Active Bookings"
          value={metrics.activeBookings}
          loading={isLoading}
          icon={<Calendar className="h-5 w-5 text-amber-500" />}
          gradient="from-amber-400 to-orange-500"
          delay={0.3}
        />
        <StatsCard
          title="Pending Approvals"
          value={metrics.pendingVerifications}
          loading={isLoading}
          icon={<AlertCircle className="h-5 w-5 text-rose-500" />}
          gradient="from-rose-500 to-pink-600"
          delay={0.4}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mt-8">
        {/* Recent Hostels */}
        <motion.div variants={itemVariants} className="xl:col-span-2">
          <Card className="shadow-sm border-slate-200 overflow-hidden h-full">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 flex flex-row items-center justify-between py-5">
              <CardTitle className="text-lg text-slate-800">
                Recent Hostel Signups
              </CardTitle>
              <Link
                to="/admin/hostels"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group"
              >
                View all{" "}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12 text-center bg-white">
                  <Loader2 className="h-8 w-8 animate-spin text-indigo-400 mb-4" />
                  <span className="text-slate-400 font-medium">
                    Loading network data...
                  </span>
                </div>
              ) : recentHostels.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center bg-white">
                  <span className="text-slate-400">
                    No properties in the system yet.
                  </span>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {recentHostels.map((hostel) => (
                    <div
                      key={hostel.id}
                      className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold">
                          {hostel.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">
                            {hostel.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            Owner:{" "}
                            {hostel.users
                              ? `${hostel.users.first_name} ${hostel.users.last_name}`
                              : "Unknown"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span
                          className={`px-2.5 py-1 text-xs font-semibold rounded-full ${hostel.status === "approved" ? "bg-emerald-100 text-emerald-700" : hostel.status === "pending" ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"}`}
                        >
                          {hostel.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Alerts & Quick Actions */}
        <motion.div variants={itemVariants} className="space-y-6">
          <Card className="shadow-sm border-amber-200 bg-amber-50/30 overflow-hidden">
            <CardHeader className="py-4 border-b border-amber-100/50 bg-amber-100/20">
              <CardTitle className="flex items-center gap-2 text-amber-900 text-lg">
                <AlertCircle className="h-5 w-5 text-amber-500" />
                Action Required
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              {metrics.pendingVerifications > 0 ? (
                <div className="p-4 bg-white rounded-xl border border-amber-200 shadow-sm">
                  <p className="font-bold text-amber-900 text-lg">
                    {metrics.pendingVerifications} Pending Hostels
                  </p>
                  <p className="text-sm text-amber-700/80 mt-1 mb-4">
                    Properties are waiting for your verification before they go
                    live on the student portal.
                  </p>
                  <Link
                    to="/admin/hostels"
                    className="inline-flex w-full items-center justify-center px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                  >
                    Review Hostels <ExternalLink className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              ) : (
                <div className="p-6 text-center bg-white rounded-xl border border-emerald-100 shadow-sm">
                  <div className="h-12 w-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <p className="font-medium text-emerald-900">All Caught Up!</p>
                  <p className="text-sm text-emerald-600/80 mt-1">
                    No pending verifications.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}

function StatsCard({
  title,
  value,
  loading,
  icon,
  gradient,
  delay,
}: {
  title: string;
  value: string | number;
  loading: boolean;
  icon: React.ReactNode;
  gradient: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay, type: "spring", stiffness: 300, damping: 24 }}
    >
      <Card className="border-slate-200 shadow-sm bg-white overflow-hidden relative group hover:border-indigo-200 transition-colors">
        <div
          className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${gradient} opacity-80`}
        />
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-500">{title}</h3>
            <div className="p-2 bg-slate-50 rounded-lg group-hover:scale-110 transition-transform">
              {icon}
            </div>
          </div>
          {loading ? (
            <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
          ) : (
            <div className="text-4xl font-black text-slate-900 tracking-tight">
              {value}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
