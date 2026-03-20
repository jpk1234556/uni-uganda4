import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Save, UserPlus, Shield } from "lucide-react";

export default function Settings() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Platform Settings</h2>
        <p className="text-muted-foreground mt-2">Manage application configuration and administrative profiles.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* System Configs */}
        <Card className="border-slate-200 shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-indigo-500" />
              Security Settings
            </CardTitle>
            <CardDescription>Global authentication and security rules.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Require Email Verification</Label>
                <p className="text-sm text-slate-500">New users must verify email to book hostels.</p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Auto-Approve Hostels</Label>
                <p className="text-sm text-slate-500">Bypass manual verification for new listings.</p>
              </div>
              <Switch />
            </div>

            <div className="pt-4">
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                <Save className="h-4 w-4 mr-2" /> Save Settings
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Add New Admin */}
        <Card className="border-slate-200 shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-indigo-500" />
              Invite New Admin
            </CardTitle>
            <CardDescription>Grant Super Admin privileges to team members.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Admin Email Address</Label>
              <Input placeholder="colleague@uninest.ug" />
            </div>
            <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-md border">
              Invited users will receive an email to set up their super admin credentials. They will have full access to users, payouts, and approvals.
            </p>
            <Button variant="outline" className="w-full border-indigo-200 text-indigo-700 hover:bg-indigo-50">
              Send Invite
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
