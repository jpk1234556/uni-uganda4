import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Save, UserPlus, Shield } from "lucide-react";
import { toast } from "sonner";

export default function Settings() {
  const [requireEmailVerification, setRequireEmailVerification] =
    useState(true);
  const [autoApproveHostels, setAutoApproveHostels] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isInviting, setIsInviting] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("admin-platform-settings");
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved) as {
        requireEmailVerification?: boolean;
        autoApproveHostels?: boolean;
      };

      if (typeof parsed.requireEmailVerification === "boolean") {
        setRequireEmailVerification(parsed.requireEmailVerification);
      }
      if (typeof parsed.autoApproveHostels === "boolean") {
        setAutoApproveHostels(parsed.autoApproveHostels);
      }
    } catch {
      localStorage.removeItem("admin-platform-settings");
    }
  }, []);

  const handleSaveSettings = () => {
    try {
      setIsSaving(true);
      localStorage.setItem(
        "admin-platform-settings",
        JSON.stringify({ requireEmailVerification, autoApproveHostels }),
      );
      toast.success("Settings saved");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendInvite = async () => {
    const email = inviteEmail.trim().toLowerCase();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      toast.error("Enter a valid email address");
      return;
    }

    try {
      setIsInviting(true);
      const inviteLink = `${window.location.origin}/auth?invite=${encodeURIComponent(email)}&role=super_admin`;
      await navigator.clipboard.writeText(inviteLink);
      toast.success("Invite link copied to clipboard");
      setInviteEmail("");
    } catch {
      toast.error("Could not copy invite link");
    } finally {
      setIsInviting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
          Platform Settings
        </h2>
        <p className="text-muted-foreground mt-2">
          Manage application configuration and administrative profiles.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* System Configs */}
        <Card className="border-slate-200 shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-indigo-500" />
              Security Settings
            </CardTitle>
            <CardDescription>
              Global authentication and security rules.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Require Email Verification</Label>
                <p className="text-sm text-slate-500">
                  New users must verify email to book hostels.
                </p>
              </div>
              <Switch
                checked={requireEmailVerification}
                onCheckedChange={setRequireEmailVerification}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Auto-Approve Hostels</Label>
                <p className="text-sm text-slate-500">
                  Bypass manual verification for new listings.
                </p>
              </div>
              <Switch
                checked={autoApproveHostels}
                onCheckedChange={setAutoApproveHostels}
              />
            </div>

            <div className="pt-4">
              <Button
                onClick={handleSaveSettings}
                disabled={isSaving}
                className="w-full bg-indigo-600 hover:bg-indigo-700"
              >
                <Save className="h-4 w-4 mr-2" />{" "}
                {isSaving ? "Saving..." : "Save Settings"}
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
            <CardDescription>
              Grant Super Admin privileges to team members.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Admin Email Address</Label>
              <Input
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="colleague@uninest.ug"
              />
            </div>
            <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-md border">
              Invited users will receive an email to set up their super admin
              credentials. They will have full access to users, payouts, and
              approvals.
            </p>
            <Button
              onClick={handleSendInvite}
              disabled={isInviting}
              variant="outline"
              className="w-full border-indigo-200 text-indigo-700 hover:bg-indigo-50"
            >
              {isInviting ? "Sending..." : "Send Invite"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
