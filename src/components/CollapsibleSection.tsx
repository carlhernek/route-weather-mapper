
import React from 'react';
import { 
  Collapsible, 
  CollapsibleTrigger, 
  CollapsibleContent 
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";

interface CollapsibleSectionProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

const CollapsibleSection = ({ 
  title, 
  defaultOpen = true, 
  children, 
  icon, 
  className = "" 
}: CollapsibleSectionProps) => {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className={`rounded-lg border shadow bg-white/80 backdrop-blur-sm ${className}`}
    >
      <CollapsibleTrigger className="flex w-full items-center justify-between p-4 font-medium">
        <div className="flex items-center gap-2">
          {icon}
          <span>{title}</span>
        </div>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 transition-transform" />
        ) : (
          <ChevronDown className="h-4 w-4 transition-transform" />
        )}
      </CollapsibleTrigger>
      <CollapsibleContent className="p-4 pt-0 space-y-2">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
};

export default CollapsibleSection;
