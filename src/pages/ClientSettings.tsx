import { useParams } from "react-router-dom";
import { ChatSidebar } from "@/components/ChatSidebar";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { ClientSwitcher } from "@/components/ClientSwitcher";
import { ConnectionsButtons } from "@/components/advertising/ConnectionsButtons";
import { N8nConnectForm } from "@/components/integrations/N8nConnectForm";

const ClientSettings = () => {
  const { clientId } = useParams();

  return (
    <div className="flex h-screen w-full bg-background">
      <ChatSidebar />
      <main className="flex-1 overflow-auto">
        <div className="border-b border-border bg-background">
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center gap-3">
              <Settings className="h-5 w-5 text-muted-foreground" />
              <h1 className="text-2xl font-bold text-foreground">Settings</h1>
              <span className="text-sm text-muted-foreground">for</span>
              <ClientSwitcher />
            </div>
            <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
              Save
            </Button>
          </div>
        </div>

        <div className="p-10 space-y-6">
          <div className="text-sm text-muted-foreground">
            Client-wide settings and configuration will appear here.
          </div>
          <ConnectionsButtons />

        </div>
      </main>
    </div>
  );
};

export default ClientSettings;


