import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AdminSidebar } from "@/components/AdminSidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { N8nConnectForm } from "@/components/integrations/N8nConnectForm";
import { ThemesSettings } from "@/components/settings/ThemesSettings";
import { useTheme } from "@/contexts/ThemeContext";
import { useFeatureToggle } from "@/hooks/useFeatureToggle";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Monitor, Moon, Sun, Building2, Users, AlertTriangle, Brush, Shield, Bell, Plug } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { untypedSupabase as supabase } from "@/integrations/supabase/untyped-client";

const AdminSettings = () => {
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

  return (
    <div className="flex h-screen w-full bg-background">
      <AdminSidebar />
      <main className="flex-1 overflow-auto p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-foreground">Agency Settings</h1>
          <p className="text-sm text-muted-foreground">Global configuration for the entire agency.</p>
        </div>

        <Tabs defaultValue="security" className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-4">
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="theme" className="flex items-center gap-2">
              <Brush className="h-4 w-4" />
              Theme Builder
            </TabsTrigger>
            <TabsTrigger value="integrations" className="flex items-center gap-2">
              <Plug className="h-4 w-4" />
              Integrations
            </TabsTrigger>
          </TabsList>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card className="border border-border bg-card p-6">
              <h3 className="mb-4 text-base font-semibold text-foreground">Security Settings</h3>
              <div className="flex items-center justify-between rounded-md border border-border p-4">
                <div>
                  <Label htmlFor="2fa">Require two-factor authentication</Label>
                  <p className="text-xs text-muted-foreground">Recommended for all admin users.</p>
                </div>
                <Switch id="2fa" />
              </div>
              <div className="mt-3 flex items-center justify-between rounded-md border border-border p-4">
                <div>
                  <Label htmlFor="sso">Enable SSO</Label>
                  <p className="text-xs text-muted-foreground">Centralize login via your identity provider.</p>
                </div>
                <Switch id="sso" />
              </div>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="border border-border bg-card p-6">
              <h3 className="mb-4 text-base font-semibold text-foreground">Notification Preferences</h3>
              <div className="flex items-center justify-between rounded-md border border-border p-4">
                <div>
                  <Label htmlFor="digest">Weekly performance digest</Label>
                  <p className="text-xs text-muted-foreground">Summarized metrics and alerts.</p>
                </div>
                <Switch id="digest" defaultChecked />
              </div>
              <div className="mt-3 flex items-center justify-between rounded-md border border-border p-4">
                <div>
                  <Label htmlFor="incident">Critical incident alerts</Label>
                  <p className="text-xs text-muted-foreground">Immediate notifications for outages.</p>
                </div>
                <Switch id="incident" defaultChecked />
              </div>
            </Card>
          </TabsContent>

          {/* Theme Builder Tab */}
          <TabsContent value="theme" className="space-y-6">
            {!featureLoading && !themeBuilderEnabled ? (
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
            ) : (
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
            )}
          </TabsContent>

          {/* Integrations Tab */}
          <TabsContent value="integrations" className="space-y-6">
            <N8nConnectForm scope="agency" />
          </TabsContent>
        </Tabs>

        <div className="mt-6">
          <Button className="gap-2">Save Settings</Button>
        </div>
      </main>
    </div>
  );
};

export default AdminSettings;
