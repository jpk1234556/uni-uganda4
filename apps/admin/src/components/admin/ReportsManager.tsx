import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, Filter, Download, LineChart, PieChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function ReportsManager() {
  const navigate = useNavigate();
  const [isExporting, setIsExporting] = useState(false);
  const [dateRange, setDateRange] = useState<"this_month" | "last_30_days" | "all_time">("this_month");

  const dateRangeLabel = useMemo(() => {
    if (dateRange === "this_month") return "This Month";
    if (dateRange === "last_30_days") return "Last 30 Days";
    return "All Time";
  }, [dateRange]);

  const getStartDate = () => {
    if (dateRange === "all_time") return null;

    const now = new Date();
    if (dateRange === "this_month") {
      return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    }

    const last30 = new Date();
    last30.setDate(last30.getDate() - 30);
    return last30.toISOString();
  };

  const handleCycleDateRange = () => {
    setDateRange((prev) => {
      if (prev === "this_month") return "last_30_days";
      if (prev === "last_30_days") return "all_time";
      return "this_month";
    });
  };

  const escapeCsv = (value: unknown) => {
    const raw = String(value ?? "");
    return `"${raw.replace(/"/g, '""')}"`;
  };

  const handleExportCsv = async () => {
    try {
      setIsExporting(true);

      let query = supabase
        .from("bookings")
        .select(`
          id,
          status,
          move_in_date,
          created_at,
          users!bookings_student_id_fkey(first_name, last_name, email),
          hostels(name)
        `)
        .order("created_at", { ascending: false });

      const startDate = getStartDate();
      if (startDate) {
        query = query.gte("created_at", startDate);
      }

      const { data, error } = await query;
      if (error) throw error;

      if (!data || data.length === 0) {
        toast.info("No records found for the selected date range");
        return;
      }

      const header = [
        "Booking ID",
        "Student Name",
        "Student Email",
        "Hostel",
        "Status",
        "Move In Date",
        "Created At",
      ];

      const rows = data.map((booking: any) => [
        booking.id,
        booking.users ? `${booking.users.first_name ?? ""} ${booking.users.last_name ?? ""}`.trim() : "Unknown",
        booking.users?.email ?? "",
        booking.hostels?.name ?? "",
        booking.status ?? "",
        booking.move_in_date ?? "",
        booking.created_at ?? "",
      ]);

      const csv = [header, ...rows].map((row) => row.map(escapeCsv).join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `admin-bookings-${dateRange}.csv`;
      link.click();
      URL.revokeObjectURL(url);

      toast.success("CSV exported successfully");
    } catch (error) {
      toast.error("Failed to export report data");
    } finally {
      setIsExporting(false);
    }
  };

  const handleConfigureAutomation = () => {
    navigate("/admin/settings");
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      variants={containerVariants} 
      initial="hidden" 
      animate="visible" 
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-indigo-500" />
            System Analytics
          </h2>
          <p className="text-slate-500 mt-2 text-lg">Generate and export platform performance metrics and revenue reports.</p>
        </div>
        <div className="flex items-center gap-3">
           <Button onClick={handleCycleDateRange} variant="outline" className="gap-2 bg-white text-slate-600 border-slate-200 hover:bg-slate-50 shadow-sm">
             <Filter className="h-4 w-4" /> {dateRangeLabel}
           </Button>
           <Button onClick={handleExportCsv} disabled={isExporting} className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all">
             <Download className="h-4 w-4" /> {isExporting ? "Exporting..." : "Export CSV"}
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <motion.div variants={itemVariants}>
          <Card className="border-slate-200 shadow-sm bg-white overflow-hidden rounded-xl h-80 flex flex-col items-center justify-center p-8 outline-dashed outline-2 outline-slate-200 outline-offset-[-16px]">
            <LineChart className="h-16 w-16 text-slate-300 mb-4" />
            <h3 className="text-xl font-bold text-slate-700">Revenue Growth Chart</h3>
            <p className="text-slate-500 text-center mt-2 max-w-sm">Detailed financial plotting will be available once the mobile money integration captures 30 days of data.</p>
          </Card>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <Card className="border-slate-200 shadow-sm bg-white overflow-hidden rounded-xl h-80 flex flex-col items-center justify-center p-8 outline-dashed outline-2 outline-slate-200 outline-offset-[-16px]">
            <PieChart className="h-16 w-16 text-slate-300 mb-4" />
            <h3 className="text-xl font-bold text-slate-700">User Demographics</h3>
            <p className="text-slate-500 text-center mt-2 max-w-sm">Visual breakdown of Students vs Hostel Owners currently active on the platform.</p>
          </Card>
        </motion.div>
      </div>

      <motion.div variants={itemVariants} className="mt-8">
        <Card className="border-indigo-100 shadow-md bg-gradient-to-r from-indigo-50 to-blue-50 overflow-hidden rounded-xl">
          <CardContent className="p-8">
            <h3 className="text-xl font-bold text-indigo-900 mb-2">Automated Monthly Reports</h3>
            <p className="text-indigo-700/80 mb-6 max-w-2xl">Configure the system to automatically email detailed PDF reports on the 1st of every month summarizing total bookings, completed payments, and new user registrations.</p>
            <Button onClick={handleConfigureAutomation} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm font-medium px-6">
              Configure Automation
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
