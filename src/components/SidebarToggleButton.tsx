import { Button } from "@/components/ui/button";
import { PanelLeft } from "lucide-react";
import { useSidebarToggle } from "@/hooks/use-sidebar-toggle";
import React from "react";

type SidebarToggleButtonProps = {
  className?: string;
  "aria-label"?: string;
};

export const SidebarToggleButton: React.FC<SidebarToggleButtonProps> = ({ className, ...rest }) => {
  const { toggle } = useSidebarToggle();

  return (
    <Button
      variant="ghost"
      size="icon"
      className={className ?? "h-9 w-9"}
      onClick={toggle}
      {...rest}
    >
      <PanelLeft className="h-5 w-5" />
    </Button>
  );
};


