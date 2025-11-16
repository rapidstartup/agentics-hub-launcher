import { AdminSidebar } from "@/components/AdminSidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const AdminSettings = () => {
  return (
    <div className="flex h-screen w-full bg-background">
      <AdminSidebar />
      <main className="flex-1 overflow-auto p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-foreground">Agency Settings</h1>
          <p className="text-sm text-muted-foreground">Global configuration for the entire agency.</p>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
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

        <div className="mt-6">
          <Button className="gap-2">Save Settings</Button>
        </div>
      </main>
    </div>
  );
};

export default AdminSettings;


