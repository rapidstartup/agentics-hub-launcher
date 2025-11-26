import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Building2 } from "lucide-react";

type ClientOption = {
  slug: string;
  name: string;
  type: string;
};

/**
 * ClientSwitcher
 *
 * Allows an admin to quickly switch between clients from within any client page.
 *
 * Auth Note:
 * - In production this control should be restricted to users with admin privileges.
 * - Auth is not fully implemented yet, so this is intentionally always enabled.
 */
export function ClientSwitcher() {
  const navigate = useNavigate();
  const { clientId } = useParams();

  const clients: ClientOption[] = useMemo(
    () => [
      { slug: "techstart-solutions", name: "TechStart Solutions", type: "B2B SaaS" },
      { slug: "healthhub-medical", name: "HealthHub Medical", type: "Healthcare" },
      { slug: "global-consulting", name: "Global All-In-Consulting", type: "Consulting" },
      { slug: "imaginespace-ltd", name: "ImagineSpace Ltd", type: "Creative" },
      { slug: "smartax-corp", name: "SMARTAX Corp", type: "Finance" },
      { slug: "onward-marketing", name: "Onward Marketing Inc", type: "Marketing" },
    ],
    [],
  );

  const selectedValue = clientId ?? "all";

  const handleChange = (value: string) => {
    if (value === "all") {
      navigate("/admin");
      return;
    }
    navigate(`/client/${value}`);
  };

  const selectedClient = clients.find((c) => c.slug === selectedValue);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Select value={selectedValue} onValueChange={handleChange}>
            <SelectTrigger className="h-9 bg-background border-border text-sm inline-flex items-center gap-2">
              <Building2 className="h-4 w-4 shrink-0" />
              <SelectValue placeholder="Switch client">
                {selectedClient ? (
                  <span className="inline-flex items-center gap-1.5">
                    <span className="font-medium">{selectedClient.name}</span>
                    <span className="text-muted-foreground">—</span>
                    <span className="text-muted-foreground">{selectedClient.type}</span>
                  </span>
                ) : (
                  "Switch client"
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="all">All Clients — Overview</SelectItem>
              {clients.map((c) => (
                <SelectItem key={c.slug} value={c.slug}>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{c.name}</span>
                    <span className="text-xs text-muted-foreground">{c.type}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </TooltipTrigger>
        <TooltipContent>
          <p>Admin-only control; auth not enforced yet.</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}


