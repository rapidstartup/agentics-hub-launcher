import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ThemesSettings } from "@/components/settings/ThemesSettings";
import { useTheme } from "@/contexts/ThemeContext";
import { useFeatureToggle } from "@/hooks/useFeatureToggle";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Monitor, Moon, Sun, Building2, Users, AlertTriangle, Brush } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { AdminSidebar } from "@/components/AdminSidebar";

export default function ThemeSettings() {
  const navigate = useNavigate();
  const { mode, setMode, isAgencyAdmin, themeSource, currentClientId, setClientContext } = useTheme();
  const { enabled: themeBuilderEnabled, loading: featureLoading } = useFeatureToggle("feature.theme-builder");

  // Redirect if not authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
      }
    };
    checkAuth();
  }, [navigate]);

  // Show feature disabled message
  if (!featureLoading && !themeBuilderEnabled) {
    return (
      <div className="flex h-screen w-full bg-background">
        <AdminSidebar />
        <main className="flex-1 overflow-auto p-6 lg:p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-foreground flex items-center gap-3">
              <Brush className="h-8 w-8" />
              Theme Settings
            </h1>
            <p className="text-sm text-muted-foreground">
              Customize the visual appearance of your application
            </p>
          </div>

          {/* Feature Disabled Card */}
          <Card className="border-yellow-500/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-500">
                <AlertTriangle className="h-5 w-5" />
                Feature Disabled
              </CardTitle>
              <CardDescription>
                The Theme Builder feature is currently disabled for this platform.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Contact your administrator to enable the Theme Builder feature in the 
                <Button 
                  variant="link" 
                  className="px-1 h-auto" 
                  onClick={() => navigate('/admin/feature-toggles')}
                >
                  Feature Toggles
                </Button> 
                settings.
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-background">
      <AdminSidebar />
      <main className="flex-1 overflow-auto p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-foreground flex items-center gap-3">
            <Brush className="h-8 w-8" />
            Agency Theme Settings
          </h1>
          <p className="text-sm text-muted-foreground">
            Configure the default theme for all clients. Changes are visible in real-time on the sidebar.
          </p>
        </div>

        <div className="space-y-6">
          {/* Mode & Context Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Display Settings</CardTitle>
              <CardDescription>Control how the theme is displayed</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Theme Mode */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Theme Mode</Label>
                  <Select value={mode} onValueChange={(value: "light" | "dark" | "system") => setMode(value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover z-50">
                      <SelectItem value="light">
                        <span className="flex items-center gap-2">
                          <Sun className="h-4 w-4" />
                          Light
                        </span>
                      </SelectItem>
                      <SelectItem value="dark">
                        <span className="flex items-center gap-2">
                          <Moon className="h-4 w-4" />
                          Dark
                        </span>
                      </SelectItem>
                      <SelectItem value="system">
                        <span className="flex items-center gap-2">
                          <Monitor className="h-4 w-4" />
                          System
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Theme Source Info */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Theme Source</Label>
                  <div className="flex items-center gap-2 h-10 px-3 py-2 rounded-md border bg-muted">
                    {themeSource === 'agency' && <Building2 className="h-4 w-4 text-blue-500" />}
                    {themeSource === 'template' && <Users className="h-4 w-4 text-purple-500" />}
                    {themeSource === 'custom' && <Users className="h-4 w-4 text-green-500" />}
                    <span className="text-sm capitalize">{themeSource} Theme</span>
                  </div>
                </div>

                {/* Admin: Edit Context */}
                {isAgencyAdmin && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Editing Context</Label>
                    <Select 
                      value={currentClientId || "agency"} 
                      onValueChange={(value) => setClientContext(value === "agency" ? null : value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover z-50">
                        <SelectItem value="agency">
                          <span className="flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            Agency Default Theme
                          </span>
                        </SelectItem>
                        {/* Client options would be loaded dynamically */}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Changes made here will apply to the selected context
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Main Theme Settings */}
          <ThemesSettings />
        </div>
      </main>
    </div>
  );
}

