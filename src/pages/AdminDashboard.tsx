import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import type { Hostel } from "@/types";

export default function AdminDashboard() {
  const [pendingHostels, setPendingHostels] = useState<Hostel[]>([]);
  const [metrics, setMetrics] = useState({
    totalStudents: 0,
    totalOwners: 0,
    activeHostels: 0,
    pendingVerifications: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setIsLoading(true);
      
      // 1. Fetch pending hostels
      const { data: hostelsData, error: hostelsError } = await supabase
        .from("hostels")
        .select(`*, users!hostels_owner_id_fkey(first_name, last_name, email)`)
        .eq("status", "pending")
        .order("created_at", { ascending: false });
        
      if (hostelsError) throw hostelsError;
      setPendingHostels(hostelsData || []);

      // 2. Aggregate Metrics (simplified for MVP - in production use count())
      const { count: studentCount } = await supabase.from("users").select('*', { count: 'exact', head: true }).eq('role', 'student');
      const { count: ownerCount } = await supabase.from("users").select('*', { count: 'exact', head: true }).eq('role', 'hostel_owner');
      const { count: activeHostelCount } = await supabase.from("hostels").select('*', { count: 'exact', head: true }).eq('status', 'approved');

      setMetrics({
        totalStudents: studentCount || 0,
        totalOwners: ownerCount || 0,
        activeHostels: activeHostelCount || 0,
        pendingVerifications: hostelsData?.length || 0
      });

    } catch (error: any) {
      console.error("Error fetching admin data:", error);
      toast.error("Failed to load admin dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateHostelStatus = async (hostelId: string, status: "approved" | "rejected") => {
    try {
      const { error } = await supabase
        .from("hostels")
        .update({ status })
        .eq("id", hostelId);

      if (error) throw error;
      
      toast.success(`Hostel ${status} successfully`);
      fetchAdminData(); // Refresh list and metrics
      
    } catch (error: any) {
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Super Admin Dashboard</h1>
        <p className="text-muted-foreground">Monitor platform metrics and verify new hostels.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="border-primary/10 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <div className="text-2xl font-bold">{metrics.totalStudents}</div>}
          </CardContent>
        </Card>
        <Card className="border-primary/10 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Owners</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <div className="text-2xl font-bold">{metrics.totalOwners}</div>}
          </CardContent>
        </Card>
        <Card className="border-primary/10 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Hostels</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <div className="text-2xl font-bold">{metrics.activeHostels}</div>}
          </CardContent>
        </Card>
        <Card className="border-primary/10 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Approvals</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin text-amber-500" /> : <div className="text-2xl font-bold text-amber-500">{metrics.pendingVerifications}</div>}
          </CardContent>
        </Card>
      </div>

      <Card className="border-primary/10 shadow-md">
        <CardHeader>
          <CardTitle>Pending Hostel Verifications</CardTitle>
          <CardDescription>Approve or reject new property listings to ensure platform trust and quality.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-10 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : pendingHostels.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground border border-dashed rounded-lg">
              No pending hostels to review.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hostel Name</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>University</TableHead>
                  <TableHead>Requested On</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingHostels.map((hostel: any) => (
                  <TableRow key={hostel.id}>
                    <TableCell className="font-medium">{hostel.name}</TableCell>
                    <TableCell>
                      {hostel.users ? (
                        <div className="flex flex-col">
                          <span>{hostel.users.first_name} {hostel.users.last_name}</span>
                          <span className="text-xs text-muted-foreground">{hostel.users.email}</span>
                        </div>
                      ) : "Unknown"}
                    </TableCell>
                    <TableCell>{hostel.university}</TableCell>
                    <TableCell>{new Date(hostel.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button onClick={() => handleUpdateHostelStatus(hostel.id, "approved")} variant="outline" size="sm" className="hidden lg:flex gap-1 text-green-600 hover:bg-green-50">
                          <CheckCircle className="h-4 w-4" /> Approve
                        </Button>
                        <Button onClick={() => handleUpdateHostelStatus(hostel.id, "rejected")} variant="outline" size="sm" className="hidden lg:flex gap-1 text-red-600 hover:bg-red-50">
                          <XCircle className="h-4 w-4" /> Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
