import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Receipt, Search } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";

export default function PaymentsManager() {
  const [payments, setPayments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { fetchPayments(); }, []);

  const fetchPayments = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("payments")
        .select(`
          *,
          users!payments_student_id_fkey(first_name, last_name)
        `)
        .order("created_at", { ascending: false });
        
      if (error) throw error;
      setPayments(data || []);
    } catch (error) {
      toast.error("Failed to load payments");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Payments & Revenue</h2>
        <p className="text-muted-foreground mt-2">Track manual and automated mobile money transactions.</p>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input placeholder="Search transaction ID..." className="pl-9 bg-white border-slate-200" />
        </div>
      </div>

      <Card className="border-indigo-100/50 shadow-md bg-white">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-20 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-indigo-500" /></div>
          ) : payments.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                <Receipt className="h-6 w-6 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900">No transactions recorded</h3>
              <p className="text-slate-500 max-w-sm mt-1">When students complete their bookings via mobile money, their transaction receipts will appear here.</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50/80">
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id} className="hover:bg-slate-50/50">
                    <TableCell className="font-mono text-xs text-slate-500">{payment.id.split('-')[0]}</TableCell>
                    <TableCell className="font-medium text-slate-900">
                      {payment.users ? `${payment.users.first_name} ${payment.users.last_name}` : "Unknown"}
                    </TableCell>
                    <TableCell className="font-medium text-slate-900">
                      {parseInt(payment.amount).toLocaleString('en-UG')} {payment.currency || 'UGX'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={payment.status === 'completed' ? 'default' : 'secondary'} className={payment.status === 'completed' ? "bg-emerald-500" : ""}>
                        {payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-slate-500 text-sm">
                      {format(new Date(payment.created_at), "MMM d, yyyy h:mm a")}
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
