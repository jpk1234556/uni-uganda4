import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle, CreditCard, CalendarDays } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { format } from "date-fns";

export default function BookingsManager() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          users!bookings_student_id_fkey(first_name, last_name),
          hostels(name)
        `)
        .order("created_at", { ascending: false });
        
      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      toast.error("Failed to load bookings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: "approved" | "rejected" | "completed") => {
    try {
      const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
      if (error) throw error;
      toast.success(`Booking marked as ${status}`);
      fetchBookings(); 
    } catch (error) {
      toast.error(`Failed to update booking to ${status}`);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <Badge className="bg-emerald-500">Paid & Completed</Badge>;
      case 'approved': return <Badge className="bg-blue-500">Approved (Awaiting Payment)</Badge>;
      case 'pending': return <Badge variant="secondary" className="bg-amber-100 text-amber-800">Pending Approval</Badge>;
      case 'rejected': return <Badge variant="destructive">Rejected</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Bookings Management</h2>
        <p className="text-muted-foreground mt-2">Oversee booking lifecycles from request to payment completion.</p>
      </div>

      <Card className="border-indigo-100/50 shadow-md bg-white">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-20 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-indigo-500" /></div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50/80">
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Hostel</TableHead>
                  <TableHead>Move-in Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking.id} className="hover:bg-slate-50/50">
                    <TableCell className="font-medium text-slate-900">
                      {booking.users ? `${booking.users.first_name} ${booking.users.last_name}` : "Unknown"}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {booking.hostels?.name || "Unknown Hostel"}
                    </TableCell>
                    <TableCell className="text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
                        {booking.move_in_date ? format(new Date(booking.move_in_date), "MMM d, yyyy") : "Not set"}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(booking.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      {booking.status === 'pending' && (
                        <div className="flex justify-end gap-2">
                          <Button onClick={() => handleUpdateStatus(booking.id, "approved")} variant="outline" size="sm" className="h-8 text-blue-600 border-blue-200 hover:bg-blue-50">
                            <CheckCircle className="h-4 w-4 mr-1" /> Approve
                          </Button>
                          <Button onClick={() => handleUpdateStatus(booking.id, "rejected")} variant="outline" size="sm" className="h-8 text-rose-600 border-rose-200 hover:bg-rose-50">
                            <XCircle className="h-4 w-4 mr-1" /> Reject
                          </Button>
                        </div>
                      )}
                      {booking.status === 'approved' && (
                        <div className="flex justify-end gap-2">
                          <Button onClick={() => handleUpdateStatus(booking.id, "completed")} size="sm" className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm">
                            <CreditCard className="h-4 w-4 mr-1" /> Mark Paid
                          </Button>
                        </div>
                      )}
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
