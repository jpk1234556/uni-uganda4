import { useState, useEffect, useMemo } from "react";
import type { ChangeEvent } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  MoreHorizontal,
  UserCheck,
  Ban,
  Shield,
  Home,
  GraduationCap,
  Users,
  Search,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import type { DBUser } from "@/types";
import { motion } from "framer-motion";

export default function UsersManager() {
  const [users, setUsers] = useState<DBUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<
    "all" | "student" | "hostel_owner" | "super_admin"
  >("all");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      toast.error("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateRole = async (
    userId: string,
    targetRole: "student" | "hostel_owner" | "super_admin",
  ) => {
    try {
      const { error } = await supabase
        .from("users")
        .update({ role: targetRole })
        .eq("id", userId);
      if (error) throw error;
      toast.success(`User role updated to ${targetRole.replace("_", " ")}`);
      fetchUsers();
    } catch (error) {
      toast.error("Failed to update user role");
    }
  };

  const handleToggleStatus = async (
    userId: string,
    currentStatus: boolean | undefined,
  ) => {
    try {
      const newStatus = currentStatus === false ? true : false;
      const { error } = await supabase
        .from("users")
        .update({ is_active: newStatus })
        .eq("id", userId);
      if (error) throw error;
      toast.success(`User account ${newStatus ? "activated" : "suspended"}`);
      fetchUsers();
    } catch (error) {
      toast.error("Failed to update user status");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };

  const itemVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  const filteredUsers = useMemo(() => {
    const normalizedQuery = searchTerm.trim().toLowerCase();

    return users.filter((user) => {
      const matchesRole =
        roleFilter === "all" ? true : user.role === roleFilter;
      if (!matchesRole) return false;

      if (!normalizedQuery) return true;

      const fullName = `${user.first_name ?? ""} ${user.last_name ?? ""}`
        .trim()
        .toLowerCase();
      const email = (user.email ?? "").toLowerCase();
      return (
        fullName.includes(normalizedQuery) || email.includes(normalizedQuery)
      );
    });
  }, [users, roleFilter, searchTerm]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <Users className="h-8 w-8 text-indigo-500" />
            User Management
          </h2>
          <p className="text-slate-500 mt-2 text-lg">
            Control roles, suspend accounts, and manage platform access.
          </p>
        </div>
        <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              value={searchTerm}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setSearchTerm(e.target.value)
              }
              className="pl-9 bg-white"
              placeholder="Search by name or email"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
              setRoleFilter(
                e.target.value as
                  | "all"
                  | "student"
                  | "hostel_owner"
                  | "super_admin",
              )
            }
            className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            <option value="all">All roles</option>
            <option value="student">Students</option>
            <option value="hostel_owner">Owners</option>
            <option value="super_admin">Super Admins</option>
          </select>
        </div>
      </div>

      <Card className="border-slate-200 shadow-sm bg-white overflow-hidden rounded-xl">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-24 flex flex-col items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-400 mb-4" />
              <span className="text-slate-400 font-medium">
                Fetching secure user data...
              </span>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-24 text-center">
              <span className="text-slate-400">
                No users match your current filters.
              </span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50 border-b border-slate-100">
                  <TableRow className="hover:bg-slate-50">
                    <TableHead className="w-[300px] text-slate-500 font-semibold h-12">
                      User Identity
                    </TableHead>
                    <TableHead className="text-slate-500 font-semibold">
                      Contact Email
                    </TableHead>
                    <TableHead className="text-slate-500 font-semibold">
                      Assigned Role
                    </TableHead>
                    <TableHead className="text-slate-500 font-semibold">
                      Account Status
                    </TableHead>
                    <TableHead className="text-right text-slate-500 font-semibold pr-6">
                      Security Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <motion.tbody
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="divide-y divide-slate-100"
                >
                  {filteredUsers.map((u) => (
                    <motion.tr
                      variants={itemVariants}
                      key={u.id}
                      className="group hover:bg-slate-50/50 transition-colors"
                    >
                      <TableCell className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold shadow-sm">
                            {u.first_name?.charAt(0) || "?"}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                              {u.first_name} {u.last_name}
                            </span>
                            <span className="text-xs text-slate-400">
                              ID: {u.id.split("-")[0]}...
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-600 font-medium">
                        {u.email}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 capitalize font-medium text-slate-700">
                          {u.role === "super_admin" && (
                            <Shield className="h-4 w-4 text-indigo-500" />
                          )}
                          {u.role === "hostel_owner" && (
                            <Home className="h-4 w-4 text-amber-500" />
                          )}
                          {u.role === "student" && (
                            <GraduationCap className="h-4 w-4 text-emerald-500" />
                          )}
                          {u.role.replace("_", " ")}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            u.is_active === false ? "destructive" : "default"
                          }
                          className={
                            u.is_active !== false
                              ? "bg-emerald-100 text-emerald-700 border-0"
                              : "bg-rose-100 text-rose-700 border-0"
                          }
                        >
                          {u.is_active === false ? "Suspended" : "Active"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              className="h-8 w-8 p-0 hover:bg-slate-200"
                              disabled={u.role === "super_admin"}
                            >
                              <MoreHorizontal className="h-4 w-4 text-slate-500" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="w-56 rounded-xl shadow-lg border-slate-200"
                          >
                            <DropdownMenuLabel className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                              Security Controls
                            </DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() =>
                                handleToggleStatus(u.id, u.is_active)
                              }
                              className="cursor-pointer focus:bg-slate-100"
                            >
                              {u.is_active === false ? (
                                <>
                                  <UserCheck className="mr-2 h-4 w-4 text-emerald-500" />{" "}
                                  Restore Access
                                </>
                              ) : (
                                <>
                                  <Ban className="mr-2 h-4 w-4 text-rose-500" />{" "}
                                  Suspend Account
                                </>
                              )}
                            </DropdownMenuItem>

                            <DropdownMenuSeparator className="bg-slate-100" />
                            <DropdownMenuLabel className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                              Privilege Escalation
                            </DropdownMenuLabel>

                            {u.role !== "student" && (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleUpdateRole(u.id, "student")
                                }
                                className="cursor-pointer focus:bg-slate-100"
                              >
                                <GraduationCap className="mr-2 h-4 w-4 text-emerald-500" />{" "}
                                Demote to Student
                              </DropdownMenuItem>
                            )}
                            {u.role !== "hostel_owner" && (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleUpdateRole(u.id, "hostel_owner")
                                }
                                className="cursor-pointer focus:bg-slate-100"
                              >
                                <Home className="mr-2 h-4 w-4 text-amber-500" />{" "}
                                Promote to Owner
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
