import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { 
  Users, 
  Building2, 
  ShieldCheck, 
  AlertTriangle, 
  TrendingUp, 
  DollarSign,
  Eye,
  CheckCircle2,
  Clock,
  Star,
  Settings,
  FileText,
  MessageSquare,
  Search
} from "lucide-react";

export default function AdminDashboard() {
  const { dbUser } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalHostels: 0,
    pendingHostels: 0,
    totalBookings: 0,
    revenue: 0
  });
  const [users, setUsers] = useState([]);
  const [hostels, setHostels] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch stats
      const { data: usersData } = await supabase.from('users').select('*');
      const { data: hostelsData } = await supabase.from('hostels').select('*');
      const { data: bookingsData } = await supabase.from('bookings').select('*');
      
      if (usersData) {
        const totalUsers = usersData.length;
        const totalHostels = hostelsData?.length || 0;
        const pendingHostels = hostelsData?.filter(h => h.status === 'pending').length || 0;
        const totalBookings = bookingsData?.length || 0;
        const approvedBookings = bookingsData?.filter(b => b.status === 'approved').length || 0;
        
        setStats({
          totalUsers,
          totalHostels,
          pendingHostels,
          totalBookings,
          revenue: approvedBookings * 500000 // Average booking fee
        });
        
        setUsers(usersData?.slice(0, 5) || []);
        setHostels(hostelsData?.slice(0, 5) || []);
        setBookings(bookingsData?.slice(0, 5) || []);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveHostel = async (hostelId: string) => {
    try {
      await supabase.from('hostels').update({ status: 'approved' }).eq('id', hostelId);
      setHostels(hostels.map(h => h.id === hostelId ? { ...h, status: 'approved' } : h));
    } catch (error) {
      console.error("Error approving hostel:", error);
    }
  };

  const handleSuspendUser = async (userId: string) => {
    try {
      await supabase.from('users').update({ is_active: false }).eq('id', userId);
      setUsers(users.map(u => u.id === userId ? { ...u, is_active: false } : u));
    } catch (error) {
      console.error("Error suspending user:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {dbUser?.first_name}!</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hostels</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalHostels}</div>
            <p className="text-xs text-muted-foreground">{stats.pendingHostels} pending approval</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBookings}</div>
            <p className="text-xs text-muted-foreground">+8% from last week</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">UGX {(stats.revenue / 1000).toFixed(1)}K</div>
            <p className="text-xs text-muted-foreground">+15% from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="hostels">Hostels</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">New registrations</span>
                    <Badge variant="secondary">+24</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Pending approvals</span>
                    <Badge variant="outline">{stats.pendingHostels}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button className="w-full justify-start">
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Review Pending Hostels
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Send System Announcement
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                User Management
                <div className="flex items-center space-x-2">
                  <Input placeholder="Search users..." className="max-w-xs" />
                  <Button size="sm">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map(user => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div>
                        <p className="font-medium">{user.first_name} {user.last_name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <Badge variant={user.is_active ? "default" : "destructive"}>
                          {user.is_active ? "Active" : "Suspended"}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {!user.is_active && (
                        <Button size="sm" onClick={() => handleSuspendUser(user.id)}>
                          <AlertTriangle className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hostels" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Hostel Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {hostels.map(hostel => (
                  <div key={hostel.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div>
                        <p className="font-medium">{hostel.name}</p>
                        <p className="text-sm text-muted-foreground">{hostel.university}</p>
                        <p className="text-sm text-muted-foreground">{hostel.address}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={hostel.status === 'approved' ? 'default' : 'secondary'}>
                          {hostel.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {hostel.status === 'pending' && (
                        <Button size="sm" onClick={() => handleApproveHostel(hostel.id)}>
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bookings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bookings.map(booking => (
                  <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div>
                        <p className="font-medium">Booking #{booking.id.slice(0, 8)}</p>
                        <p className="text-sm text-muted-foreground">{booking.move_in_date}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={booking.status === 'approved' ? 'default' : 'secondary'}>
                          {booking.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
