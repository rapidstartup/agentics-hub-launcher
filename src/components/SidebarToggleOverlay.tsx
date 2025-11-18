import React from "react";
import { SidebarToggleButton } from "./SidebarToggleButton";
import { useSidebarToggle } from "@/hooks/use-sidebar-toggle";

export const SidebarToggleOverlay: React.FC = () => {
  const { isOpen } = useSidebarToggle();

  // Offset the button when sidebar is open so it appears in the page header area.
  const leftOffset = isOpen ? 8 + 256 : 8; // 0.5rem + sidebar width

  return (
    <div
      style={{ position: "fixed", top: 8, left: leftOffset, zIndex: 60 }}
      aria-hidden={false}
    >
      <SidebarToggleButton aria-label="Toggle sidebar" />
    </div>
  );
};


