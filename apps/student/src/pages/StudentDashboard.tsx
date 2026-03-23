import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Home, ClipboardList, UserCircle, Loader2, GraduationCap, Smartphone, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Payment UI State
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const fetchApplications = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          id,
          status,
          created_at,
          room_types ( name, price ),
          hostels ( name, owner_id )
        `)
        .eq("student_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch {
      toast.error("Failed to load applications");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchApplications();
    }
  }, [user, fetchApplications]);

  const handleOpenPayment = (app: any) => {
    setSelectedBooking(app);
    setIsPaymentOpen(true);
  };

  const handleConfirmPayment = async () => {
    if (!selectedBooking || !user) return;
    try {
      setIsConfirming(true);
      
      // We insert a "pending" payment record. 
      // The admin will later verify the mobile money text and mark the payment and booking as "completed".
      const { error } = await supabase.from("payments").insert({
        booking_id: selectedBooking.id,
        student_id: user.id,
        hostel_owner_id: selectedBooking.hostels.owner_id,
        amount: selectedBooking.room_types.price,
        status: "pending",
        platform_fee: 0
      });

      if (error) throw error;

      toast.success("Payment details submitted! Admin will verify your transaction shortly.");
      setIsPaymentOpen(false);
      fetchApplications();
    } catch (error: any) {
      toast.error("Failed to submit payment confirmation: " + error.message);
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50/50 pb-12">
      {/* Header Area */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 dark:from-blue-950/20 dark:border-blue-900/50 pt-10 pb-12 mb-8">
        <div className="container mx-auto px-4 max-w-5xl animate-in fade-in duration-500">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-blue-100 text-blue-700 rounded-full dark:bg-blue-900/50 dark:text-blue-400">
              <GraduationCap className="h-7 w-7" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">My Dashboard</h1>
          </div>
          <p className="text-blue-800/80 dark:text-blue-300/80 max-w-2xl text-lg">Manage your booking applications, track your stays, and set up your student profile.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-5xl">
        <Tabs defaultValue="applications" className="space-y-6">
          <TabsList className="bg-white border border-slate-200 p-1.5 shadow-sm rounded-xl h-auto flex flex-wrap max-w-fit">
            <TabsTrigger value="applications" className="gap-2 px-6 py-2.5 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 rounded-lg transition-all"><ClipboardList className="h-4 w-4" /> My Applications</TabsTrigger>
            <TabsTrigger value="profile" className="gap-2 px-6 py-2.5 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 rounded-lg transition-all"><UserCircle className="h-4 w-4" /> Profile Details</TabsTrigger>
          </TabsList>

          <TabsContent value="applications">
            <Card className="border-blue-100/50 shadow-md bg-white">
            <CardHeader>
              <CardTitle>Recent Booking Requests</CardTitle>
              <CardDescription>Keep track of your hostel applications.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="py-20 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
              ) : applications.length === 0 ? (
                <div className="text-center py-10 border border-dashed rounded-lg bg-muted/20">
                  <Home className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground font-medium mb-4">You haven't applied to any hostels yet.</p>
                  <Link to="/search">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all">Find a Hostel</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {applications.map((app) => (
                    <div key={app.id} className="flex justify-between items-center p-5 border rounded-xl hover:shadow-md hover:border-blue-200 transition-all bg-white">
                      <div>
                        <h4 className="font-semibold text-lg text-slate-900">{app.hostels?.name}</h4>
                        <p className="text-sm text-slate-500 mb-1">
                          {app.room_types?.name} &bull; {new Date(app.created_at).toLocaleDateString()}
                        </p>
                        <p className="text-sm font-medium text-slate-700">Price: {app.room_types?.price?.toLocaleString()} UGX</p>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <Badge variant={app.status === "approved" ? "default" : app.status === "pending" ? "outline" : app.status === "completed" ? "default" : "destructive"} 
                               className={
                                 app.status === "approved" ? "bg-amber-500 text-white" : 
                                 app.status === "completed" ? "bg-emerald-500 text-white" : ""
                               }>
                          {app.status === "approved" ? "Awaiting Payment" : app.status === "completed" ? "Paid & Confirmed" : app.status}
                        </Badge>
                        
                        {app.status === "approved" ? (
                          <Button onClick={() => handleOpenPayment(app)} size="sm" className="bg-emerald-600 hover:bg-emerald-700 shadow-sm text-white gap-2">
                             <Smartphone className="h-4 w-4" /> Pay Now
                          </Button>
                        ) : (
                          <Button variant="ghost" size="sm" className="text-blue-600">View</Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile">
          <Card className="border-blue-100/50 shadow-md bg-white">
            <CardHeader>
              <CardTitle>Extended Profile</CardTitle>
              <CardDescription>Your tenant detail information required for bookings.</CardDescription>
            </CardHeader>
            <CardContent>
               <p className="text-sm text-muted-foreground mb-4">To speed up your hostel applications, please complete your profile details (Next of Kin, Medical History, etc.)</p>
               <Button variant="outline">Edit Profile</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>

      {/* Manual Payment Verification Dialog */}
      <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
               <Smartphone className="h-5 w-5 text-emerald-500" /> Complete Payment
            </DialogTitle>
            <DialogDescription>
              Your booking for <strong className="text-slate-900">{selectedBooking?.room_types?.name}</strong> at {selectedBooking?.hostels?.name} was approved!
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
             <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4 text-center">
                <p className="text-sm text-emerald-800 mb-1">Amount Due</p>
                <div className="text-3xl font-bold text-emerald-900">
                  {selectedBooking?.room_types?.price?.toLocaleString() || "0"} <span className="text-lg">UGX</span>
                </div>
             </div>

             <div className="space-y-4 text-sm text-slate-600">
               <p className="font-medium text-slate-900">How to pay via MTN Mobile Money / Airtel Money:</p>
               <ol className="list-decimal pl-5 space-y-2">
                 <li>Dial <strong>*165#</strong> (MTN) or <strong>*185#</strong> (Airtel)</li>
                 <li>Select <strong>Send Money</strong></li>
                 <li>Enter UniNest Uganda Merchant Number: <strong className="text-slate-900 font-mono text-base">0700 123 456</strong></li>
                 <li>Enter the exact amount shown above.</li>
                 <li>Confirm with your PIN.</li>
               </ol>
             </div>

             <div className="bg-amber-50 p-3 rounded-md text-amber-800 text-xs flex items-start gap-2 border border-amber-200">
               <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-amber-500" />
               <p>After sending the money, click the button below. Our admins will verify the transaction within 30 minutes and fully confirm your stay.</p>
             </div>
          </div>
          <DialogFooter>
            <Button onClick={handleConfirmPayment} disabled={isConfirming} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
              {isConfirming ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              I Have Sent the Money
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
