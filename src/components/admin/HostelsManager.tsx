import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle, Trash2, MapPin } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function HostelsManager() {
  const [hostels, setHostels] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { fetchHostels(); }, []);

  const fetchHostels = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("hostels")
        .select(`*, users!hostels_owner_id_fkey(first_name, last_name, email)`)
        .order("created_at", { ascending: false });
        
      if (error) throw error;
      setHostels(data || []);
    } catch (error) {
      toast.error("Failed to load hostels");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (hostelId: string, status: "approved" | "rejected") => {
    try {
      const { error } = await supabase.from("hostels").update({ status }).eq("id", hostelId);
      if (error) throw error;
      toast.success(`Hostel ${status} successfully`);
      fetchHostels(); 
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (hostelId: string) => {
    if(!confirm("Are you sure you want to permanently delete this hostel? This action builds trust by removing fake listings.")) return;
    try {
      const { error } = await supabase.from("hostels").delete().eq("id", hostelId);
      if (error) throw error;
      toast.success("Hostel deleted completely");
      fetchHostels();
    } catch (error) {
      toast.error("Failed to delete hostel");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Hostels Approval System</h2>
        <p className="text-muted-foreground mt-2">Approve real properties, ban scams, and manage all listings to build platform trust.</p>
      </div>

      <Card className="border-indigo-100/50 shadow-md bg-white">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-20 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-indigo-500" /></div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50/80">
                <TableRow>
                  <TableHead>Hostel Name</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Verified Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hostels.map((hostel) => (
                  <TableRow key={hostel.id} className="hover:bg-slate-50/50">
                    <TableCell className="font-medium text-slate-900">{hostel.name}</TableCell>
                    <TableCell className="text-slate-600">
                      {hostel.users ? `${hostel.users.first_name} ${hostel.users.last_name}` : "Unknown"}
                    </TableCell>
                    <TableCell className="text-slate-500 flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {hostel.university || hostel.address}
                    </TableCell>
                    <TableCell>
                      <Badge variant={hostel.status === "approved" ? "default" : hostel.status === "pending" ? "secondary" : "destructive"}
                             className={
                               hostel.status === "approved" ? "bg-emerald-500 hover:bg-emerald-600" :
                               hostel.status === "pending" ? "bg-amber-100 text-amber-800 hover:bg-amber-200" : ""
                             }>
                        {hostel.status === "approved" ? "Verified" : hostel.status === "pending" ? "Pending" : "Rejected"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {hostel.status === 'pending' ? (
                        <div className="flex justify-end gap-2">
                          <Button onClick={() => handleUpdateStatus(hostel.id, "approved")} variant="outline" size="sm" className="h-8 text-emerald-600 border-emerald-200 hover:bg-emerald-50">
                            <CheckCircle className="h-4 w-4 mr-1" /> Approve
                          </Button>
                          <Button onClick={() => handleUpdateStatus(hostel.id, "rejected")} variant="outline" size="sm" className="h-8 text-rose-600 border-rose-200 hover:bg-rose-50">
                            <XCircle className="h-4 w-4 mr-1" /> Reject
                          </Button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-2">
                           <Button onClick={() => handleDelete(hostel.id)} variant="ghost" size="sm" className="h-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50">
                             <Trash2 className="h-4 w-4 mr-1" /> Delete
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
