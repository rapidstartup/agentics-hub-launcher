import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Rocket, Zap } from "lucide-react";

const DEV_EMAIL = "dev@agentix.local";
const DEV_PASSWORD = "DevTest123!";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isDevLoading, setIsDevLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) throw error;

      toast({
        title: "Account created!",
        description: "You can now log in with your credentials.",
      });

      // Auto-switch to login tab
      const loginTab = document.querySelector('[value="login"]') as HTMLElement;
      if (loginTab) loginTab.click();
    } catch (error: any) {
      console.error("Signup error:", error);
      toast({
        title: "Sign up failed",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "Welcome back!",
        description: "You've successfully logged in.",
      });

      navigate("/");
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: error.message || "Invalid email or password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDevLogin = async () => {
    setIsDevLoading(true);

    try {
      // First try to sign in
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: DEV_EMAIL,
        password: DEV_PASSWORD,
      });

      if (signInError) {
        // If user doesn't exist, create them
        if (signInError.message.includes("Invalid login credentials")) {
          toast({
            title: "Creating dev account...",
            description: "Setting up admin access",
          });

          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: DEV_EMAIL,
            password: DEV_PASSWORD,
            options: {
              emailRedirectTo: `${window.location.origin}/`,
            },
          });

          if (signUpError) throw signUpError;

          // Now sign in with the new account
          const { data: newSignIn, error: newSignInError } = await supabase.auth.signInWithPassword({
            email: DEV_EMAIL,
            password: DEV_PASSWORD,
          });

          if (newSignInError) throw newSignInError;

          // Upgrade to admin role
          if (newSignIn.user) {
            const { error: roleError } = await supabase
              .from("user_roles")
              .update({ role: "agency_admin" })
              .eq("user_id", newSignIn.user.id);

            if (roleError) {
              console.warn("Could not set admin role:", roleError);
            }
          }

          toast({
            title: "Dev account created!",
            description: "Logging in with admin access...",
          });

          navigate("/");
          return;
        }
        throw signInError;
      }

      toast({
        title: "Dev Login Success!",
        description: "Welcome back, admin.",
      });

      navigate("/");
    } catch (error: any) {
      console.error("Dev login error:", error);
      toast({
        title: "Dev login failed",
        description: error.message || "Could not complete dev login",
        variant: "destructive",
      });
    } finally {
      setIsDevLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-primary/20">
            <Rocket className="h-10 w-10 text-primary" />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold">Agentix</h1>
            <p className="text-muted-foreground mt-2">
              Sign in to access your dashboard
            </p>
          </div>
        </div>

        <Card className="p-6">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    "Log In"
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    minLength={6}
                  />
                  <p className="text-xs text-muted-foreground">
                    Password must be at least 6 characters
                  </p>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </Card>

        {/* Dev Login Button */}
        <div className="space-y-3">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Development Only
              </span>
            </div>
          </div>
          
          <Button
            onClick={handleDevLogin}
            disabled={isDevLoading}
            variant="outline"
            className="w-full border-amber-500/50 bg-amber-500/10 hover:bg-amber-500/20 hover:border-amber-500 text-amber-500"
          >
            {isDevLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Setting up dev access...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-4 w-4" />
                Dev Login (Admin Access)
              </>
            )}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            {DEV_EMAIL} • Auto-creates account with full admin access
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
