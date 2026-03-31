import { useState, useEffect } from "react";
import { Table, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, MoreHorizontal, UserCheck, Ban, Shield, Home, GraduationCap, Users } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import type { DBUser } from "@/types";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export default function UsersManager() {
  const [users, setUsers] = useState<DBUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.from("users").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      toast.error("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateRole = async (userId: string, targetRole: 'student' | 'hostel_owner' | 'super_admin') => {
    try {
      const { error } = await supabase.from("users").update({ role: targetRole }).eq("id", userId);
      if (error) throw error;
      toast.success(`User role updated to ${targetRole.replace('_', ' ')}`);
      fetchUsers();
    } catch (error) {
      toast.error("Failed to update user role");
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: boolean | undefined) => {
    try {
      const newStatus = currentStatus === false ? true : false; 
      const { error } = await supabase.from("users").update({ is_active: newStatus }).eq("id", userId);
      if (error) throw error;
      toast.success(`User account ${newStatus ? 'activated' : 'suspended'}`);
      fetchUsers();
    } catch (error) {
      toast.error("Failed to update user status");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.3 }} 
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_rgba(249,115,22,0.6)]" />
            <span className="text-sm font-bold text-slate-500 tracking-wide">Module Access</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">User Management</h2>
          <p className="text-slate-500 text-sm mt-1">Access control and privilege management</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm">
          <Users className="h-4 w-4 text-slate-400" />
          <span className="text-sm font-semibold text-slate-600">Total Records: {users.length}</span>
        </div>
      </div>

      <Card className="border-slate-200 rounded-2xl shadow-sm bg-white overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-24 flex flex-col items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
              <span className="text-sm font-medium text-slate-500">Loading User Registry...</span>
            </div>
          ) : users.length === 0 ? (
             <div className="py-24 text-center">
               <span className="text-sm font-medium text-slate-500">No Records Found</span>
             </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50 border-b border-slate-200">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[300px] text-xs font-semibold text-slate-600 h-11">User Details</TableHead>
                    <TableHead className="text-xs font-semibold text-slate-600 h-11">Email Address</TableHead>
                    <TableHead className="text-xs font-semibold text-slate-600 h-11">Access Level</TableHead>
                    <TableHead className="text-xs font-semibold text-slate-600 h-11">Status</TableHead>
                    <TableHead className="text-right text-xs font-semibold text-slate-600 h-11 pr-6">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <motion.tbody 
                  variants={containerVariants} 
                  initial="hidden" 
                  animate="visible"
                  className="divide-y divide-slate-100"
                >
                  {users.map((u) => (
                    <motion.tr variants={itemVariants} key={u.id} className="group hover:bg-slate-50/50 transition-colors border-b border-slate-100 last:border-0">
                      <TableCell className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center text-sm font-bold shadow-sm">
                            {u.first_name?.charAt(0) || "?"}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-800 tracking-tight">
                              {u.first_name} {u.last_name}
                            </span>
                            <span className="text-xs text-slate-500 font-medium">UID: {u.id.split('-')[0]}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-slate-600 font-medium">{u.email}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 capitalize">
                          {u.role === 'super_admin' && <Shield className="h-4 w-4 text-primary" />}
                          {u.role === 'hostel_owner' && <Home className="h-4 w-4 text-emerald-500" />}
                          {u.role === 'student' && <GraduationCap className="h-4 w-4 text-indigo-500" />}
                          {u.role.replace('_', ' ')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className={cn(
                          "inline-flex items-center px-2.5 py-1 rounded-md border text-xs font-semibold shadow-sm",
                          u.is_active === false ? "bg-rose-50 text-rose-700 border-rose-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"
                        )}>
                          {u.is_active === false ? "Suspended" : "Active"}
                        </div>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-100 rounded-lg" disabled={u.role === 'super_admin'}>
                              <MoreHorizontal className="h-4 w-4 text-slate-500" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-lg border-slate-200 p-1">
                            <DropdownMenuLabel className="text-xs font-semibold text-slate-500 px-2 py-1.5">Security Protocol</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleToggleStatus(u.id, u.is_active)} className="cursor-pointer focus:bg-slate-50 text-sm font-medium px-2 py-2 rounded-lg">
                              {u.is_active === false ? <><UserCheck className="mr-2 h-4 w-4 text-emerald-500" /> Restore Access</> : <><Ban className="mr-2 h-4 w-4 text-rose-500" /> Suspend Account</>}
                            </DropdownMenuItem>
                            
                            <DropdownMenuSeparator className="bg-slate-100" />
                            <DropdownMenuLabel className="text-xs font-semibold text-slate-500 px-2 py-1.5">Privilege Shift</DropdownMenuLabel>
                            
                            {u.role !== 'student' && (
                              <DropdownMenuItem onClick={() => handleUpdateRole(u.id, 'student')} className="cursor-pointer focus:bg-slate-50 text-sm font-medium px-2 py-2 rounded-lg">
                                <GraduationCap className="mr-2 h-4 w-4 text-indigo-500" /> Demote to Student
                              </DropdownMenuItem>
                            )}
                            {u.role !== 'hostel_owner' && (
                              <DropdownMenuItem onClick={() => handleUpdateRole(u.id, 'hostel_owner')} className="cursor-pointer focus:bg-slate-50 text-sm font-medium px-2 py-2 rounded-lg">
                                <Home className="mr-2 h-4 w-4 text-emerald-500" /> Promote to Owner
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </motion.tr>
                  ))}
                </motion.tbody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
