import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, MoreHorizontal, UserCheck, Ban, Shield, Home, GraduationCap } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import type { DBUser } from "@/types";

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
      if (error) {
         console.error("Role update err:", error);
         throw error;
      }
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

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">User Management</h2>
        <p className="text-muted-foreground mt-2">Control roles, suspend accounts, and manage platform access.</p>
      </div>

      <Card className="border-indigo-100/50 shadow-md bg-white">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-20 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-indigo-500" /></div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50/80">
                <TableRow>
                  <TableHead className="w-[250px]">Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id} className="hover:bg-slate-50/50">
                    <TableCell className="font-medium text-slate-900">{u.first_name} {u.last_name}</TableCell>
                    <TableCell className="text-slate-500">{u.email}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 capitalize text-slate-600">
                        {u.role === 'super_admin' && <Shield className="h-3.5 w-3.5 text-indigo-500" />}
                        {u.role === 'hostel_owner' && <Home className="h-3.5 w-3.5 text-amber-500" />}
                        {u.role === 'student' && <GraduationCap className="h-3.5 w-3.5 text-blue-500" />}
                        {u.role.replace('_', ' ')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={u.is_active === false ? "destructive" : "default"} className={u.is_active !== false ? "bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20" : ""}>
                        {u.is_active === false ? "Suspended" : "Active"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0" disabled={u.role === 'super_admin'}>
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>Manage Access</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleToggleStatus(u.id, u.is_active)}>
                            {u.is_active === false ? <><UserCheck className="mr-2 h-4 w-4 text-emerald-500" /> Unsuspend</> : <><Ban className="mr-2 h-4 w-4 text-red-500" /> Suspend Account</>}
                          </DropdownMenuItem>
                          
                          <DropdownMenuSeparator />
                          <DropdownMenuLabel>Change Role</DropdownMenuLabel>
                          
                          {u.role !== 'student' && (
                            <DropdownMenuItem onClick={() => handleUpdateRole(u.id, 'student')}>
                              <GraduationCap className="mr-2 h-4 w-4" /> Make Student
                            </DropdownMenuItem>
                          )}
                          {u.role !== 'hostel_owner' && (
                            <DropdownMenuItem onClick={() => handleUpdateRole(u.id, 'hostel_owner')}>
                              <Home className="mr-2 h-4 w-4" /> Make Owner
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
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
