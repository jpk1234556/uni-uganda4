import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Building2, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export default function Auth({
  appType = "student",
}: {
  appType?: "student" | "owner" | "admin" | string;
}) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  const handleAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // For registration specifically
    const role = appType === "owner" ? "hostel_owner" : "student";
    const firstName = formData.get("first_name") as string;
    const lastName = formData.get("last_name") as string;

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        toast.success("Logged in successfully!");
        navigate("/");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              first_name: firstName,
              last_name: lastName,
              role: role || "student", // Default to student
            },
          },
        });

        if (error) throw error;
        toast.success(
          "Registration successful! Check your email to verify your account.",
        );
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred during authentication.");
    } finally {
      setIsLoading(false);
    }
  };

  const isOwner = appType === "owner";

  return (
    <div className="container relative flex min-h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0 bg-slate-50">
      <div className="relative hidden h-full flex-col p-10 text-white lg:flex bg-primary overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-orange-500 opacity-90" />
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:32px]" />
        
        <div className="relative z-20 flex items-center text-lg font-medium">
          <div className="p-2 rounded-xl flex items-center justify-center mr-3 shadow-lg bg-white/20 backdrop-blur-md">
            <Building2 className="h-7 w-7 text-white" />
          </div>
          <span className="text-3xl font-black tracking-tight text-white drop-shadow-sm">
            {isOwner
              ? "KAJU_HOUSING Partners"
              : appType === "admin"
                ? "KAJU_HOUSING Admin"
                : "KAJU_HOUSING"}
          </span>
        </div>
        
        <div className="relative z-20 mt-auto">
          <motion.blockquote
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <p className="text-2xl font-medium leading-relaxed drop-shadow-sm text-white/90">
              {isOwner
                ? "Join the network of elite property owners providing premium student accommodation across Uganda. Scale your operations with our modern management suite."
                : appType === "admin"
                  ? "Secure portal for platform administration and system oversight."
                  : '"KAJU HOUSING completely changed how I found my accommodation for the semester. No more getting scammed or walking around under the sun for hours looking for hostels."'}
            </p>
            {appType === "student" && (
              <footer className="text-primary-foreground/80 font-medium">
                Sofia Davis, Makerere University
              </footer>
            )}
            {isOwner && (
              <footer className="text-primary-foreground/80 font-medium">
                Verified Partner Program
              </footer>
            )}
          </motion.blockquote>
        </div>
      </div>
      
      <div className="lg:p-8 w-full max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Tabs
            defaultValue="login"
            className="w-full"
            onValueChange={(v: string) => setIsLogin(v === "login")}
          >
            <TabsList className={cn("grid w-full mb-8 rounded-xl bg-slate-100/80 p-1 backdrop-blur-sm", appType === "admin" ? "grid-cols-1" : "grid-cols-2")}>
              <TabsTrigger value="login" className="rounded-lg data-[state=active]:shadow-sm">
                Login
              </TabsTrigger>
              {appType !== "admin" && (
                <TabsTrigger value="register" className="rounded-lg data-[state=active]:shadow-sm">
                  Register
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="login">
              <Card className="border border-slate-200/60 shadow-xl shadow-slate-200/40 bg-white/80 backdrop-blur-xl rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
                    {isOwner ? "Access Portal" : "Welcome back"}
                  </CardTitle>
                  <CardDescription className="text-slate-500">
                    {isOwner
                      ? "Secure authentication required for console access."
                      : "Enter your email and password to log in to your account."}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAuth} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-slate-700 font-semibold">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="m@example.com"
                        required
                        className="bg-slate-50 h-12 rounded-xl focus-visible:ring-primary/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password" className="text-slate-700 font-semibold">Password</Label>
                        <Link to="/forgot-password" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                          Forgot password?
                        </Link>
                      </div>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        required
                        className="bg-slate-50 h-12 rounded-xl focus-visible:ring-primary/20"
                      />
                    </div>
                    <Button type="submit" className="w-full h-12 rounded-xl text-base font-semibold shadow-md active:scale-[0.98] transition-all" disabled={isLoading}>
                      {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Login"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="register">
              <Card className="border border-slate-200/60 shadow-xl shadow-slate-200/40 bg-white/80 backdrop-blur-xl rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
                    {isOwner ? "Partner Onboarding" : "Create an account"}
                  </CardTitle>
                  <CardDescription className="text-slate-500">
                    {isOwner
                      ? "Join the KAJU HOUSING partner network."
                      : "Enter your details below to create your account."}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAuth} className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="first_name" className="text-slate-700 font-semibold">First name</Label>
                        <Input
                          id="first_name"
                          name="first_name"
                          required
                          className="bg-slate-50 h-12 rounded-xl focus-visible:ring-primary/20"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="last_name" className="text-slate-700 font-semibold">Last name</Label>
                        <Input
                          id="last_name"
                          name="last_name"
                          required
                          className="bg-slate-50 h-12 rounded-xl focus-visible:ring-primary/20"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register_email" className="text-slate-700 font-semibold">Email</Label>
                      <Input
                        id="register_email"
                        name="email"
                        type="email"
                        placeholder="m@example.com"
                        required
                        className="bg-slate-50 h-12 rounded-xl focus-visible:ring-primary/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register_password" className="text-slate-700 font-semibold">Password</Label>
                      <Input
                        id="register_password"
                        name="password"
                        type="password"
                        required
                        minLength={6}
                        className="bg-slate-50 h-12 rounded-xl focus-visible:ring-primary/20"
                      />
                    </div>
                    <Button type="submit" className="w-full h-12 rounded-xl text-base font-semibold shadow-md active:scale-[0.98] transition-all" disabled={isLoading}>
                      {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : (isOwner ? "Create Partner Account" : "Create Account")}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
