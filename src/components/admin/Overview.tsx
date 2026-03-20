import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function Overview() {
  const [metrics, setMetrics] = useState({
    totalStudents: 0,
    totalOwners: 0,
    activeHostels: 0,
    pendingVerifications: 0,
    activeBookings: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      setIsLoading(true);
      
      const { data: usersCount, error: usersErr } = await supabase.from('users').select('role', { count: 'exact' });
      const { data: hostelsData, error: hostelsErr } = await supabase.from('hostels').select('status', { count: 'exact' });
      const { count: bookingsCount, error: bookingsErr } = await supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'approved');

      if (usersErr || hostelsErr || bookingsErr) throw new Error("Failed to load metrics");

      const studentCount = usersCount?.filter((u: any) => u.role === 'student').length || 0;
      const ownerCount = usersCount?.filter((u: any) => u.role === 'hostel_owner').length || 0;
      const activeHostels = hostelsData?.filter((h: any) => h.status === 'approved').length || 0;
      const pendingHostels = hostelsData?.filter((h: any) => h.status === 'pending').length || 0;

      setMetrics({
        totalStudents: studentCount,
        totalOwners: ownerCount,
        activeHostels,
        pendingVerifications: pendingHostels,
        activeBookings: bookingsCount || 0
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard Overview</h2>
        <p className="text-muted-foreground mt-2">Welcome to the Super Admin Control Center.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Users" value={metrics.totalStudents + metrics.totalOwners} loading={isLoading} />
        <StatsCard title="Total Hostels" value={metrics.activeHostels + metrics.pendingVerifications} loading={isLoading} />
        <StatsCard title="Active Bookings" value={metrics.activeBookings} loading={isLoading} />
        <StatsCard 
          title="Revenue" 
          value="Ugx 0" 
          loading={isLoading} 
          subtitle="Awaiting payment integration" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Hostels */}
        <Card className="shadow-sm border-indigo-100/50">
          <CardHeader>
            <CardTitle>Recent Hostel Signups</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-center bg-slate-50 rounded-lg border border-dashed border-slate-200">
              <span className="text-slate-400">Loading recent properties...</span>
            </div>
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card className="shadow-sm border-amber-100 bg-amber-50/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-900">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              System Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {metrics.pendingVerifications > 0 ? (
              <div className="p-4 bg-white rounded-lg border border-amber-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="font-medium text-amber-900">Pending Hostels</p>
                  <p className="text-sm text-muted-foreground">{metrics.pendingVerifications} hostels await your approval.</p>
                </div>
              </div>
            ) : (
                <p className="text-sm text-muted-foreground p-4 bg-white rounded-lg border shadow-sm">No critical alerts to display.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatsCard({ title, value, loading, subtitle }: { title: string; value: string | number; loading: boolean; subtitle?: string }) {
  return (
    <Card className="border-slate-200 shadow-sm bg-white overflow-hidden relative">
      <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin text-slate-300" />
        ) : (
          <div>
            <div className="text-3xl font-bold tracking-tight text-slate-900">{value}</div>
            {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
