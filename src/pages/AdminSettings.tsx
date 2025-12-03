import { AdminSidebar } from "@/components/AdminSidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { N8nConnectForm } from "@/components/integrations/N8nConnectForm";
import { useNavigate } from "react-router-dom";
import { Brush, ChevronRight, Palette, Building2 } from "lucide-react";
import { useFeatureToggle } from "@/hooks/useFeatureToggle";

const AdminSettings = () => {
  const navigate = useNavigate();
  const { enabled: themeBuilderEnabled } = useFeatureToggle("feature.theme-builder");

  return (
    <div className="flex h-screen w-full bg-background">
      <AdminSidebar />
      <main className="flex-1 overflow-auto p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-foreground">Agency Settings</h1>
          <p className="text-sm text-muted-foreground">Global configuration for the entire agency.</p>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {/* Theme Builder Card - Only shown if feature is enabled */}
          {themeBuilderEnabled && (
            <Card 
              className="border border-border bg-card p-6 cursor-pointer hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all duration-200 group"
              onClick={() => navigate('/settings/themes')}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Brush className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                      Theme Builder
                      <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                        New
                      </span>
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Customize colors, backgrounds, sidebars, cards, and more across the entire platform.
                    </p>
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Palette className="h-3.5 w-3.5" />
                        <span>Agency-wide defaults</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Building2 className="h-3.5 w-3.5" />
                        <span>Per-client themes</span>
                      </div>
                    </div>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </Card>
          )}

          <Card className="border border-border bg-card p-6">
            <h3 className="mb-4 text-base font-semibold text-foreground">Security</h3>
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

          <Card className="border border-border bg-card p-6">
            <h3 className="mb-4 text-base font-semibold text-foreground">Notifications</h3>
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
        </div>

        <div className="grid grid-cols-1 gap-6 mt-6">
          <N8nConnectForm scope="agency" />
        </div>

        <div className="mt-6">
          <Button className="gap-2">Save Settings</Button>
        </div>
      </main>
    </div>
  );
};

export default AdminSettings;


