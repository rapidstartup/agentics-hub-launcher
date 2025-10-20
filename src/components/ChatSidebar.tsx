import { Plus, MessageSquare, Settings, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ChatHistoryItem {
  id: string;
  title: string;
  timestamp: string;
}

export const ChatSidebar = () => {
  const chatHistory: ChatHistoryItem[] = [
    { id: "1", title: "New Carl Allen's Second Brain Chat", timestamp: "6d ago" },
    { id: "2", title: "New Consulting for Equity Chat", timestamp: "6d ago" },
    { id: "3", title: "Pickleball Companies Acquisition", timestamp: "6d ago" },
    { id: "4", title: "Medspa Industry Insights", timestamp: "6d ago" },
    { id: "5", title: "New Email Outreach Chat", timestamp: "6d ago" },
  ];

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-border bg-sidebar">
      {/* New Chat Button */}
      <div className="p-4">
        <Button 
          variant="outline" 
          className="w-full justify-start gap-2 border-border bg-transparent hover:bg-sidebar-accent"
        >
          <Plus className="h-4 w-4" />
          <span>New chat</span>
        </Button>
      </div>

      {/* Chat History */}
      <ScrollArea className="flex-1 px-2">
        <div className="space-y-1">
          {chatHistory.map((chat) => (
            <button
              key={chat.id}
              className="w-full rounded-md px-3 py-3 text-left transition-colors hover:bg-sidebar-accent"
            >
              <div className="flex items-start gap-2">
                <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="flex-1 overflow-hidden">
                  <p className="truncate text-sm text-foreground">{chat.title}</p>
                  <p className="text-xs text-muted-foreground">{chat.timestamp}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>

      {/* Bottom Icons */}
      <div className="flex items-center justify-around border-t border-border p-4">
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <MessageSquare className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <User className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </aside>
  );
};
