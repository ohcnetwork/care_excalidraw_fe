import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/careui/tooltip";
import { useState } from "react";
import { cn } from "@/lib/utils";

function TooltipComponent({
  children,
  content,
  className,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  const [open, setOpen] = useState(false);
  return (
    <TooltipProvider>
      <Tooltip open={open} onOpenChange={setOpen} delayDuration={0}>
        <TooltipTrigger asChild onClick={() => setOpen(!open)}>
          {children}
        </TooltipTrigger>
        <TooltipContent
          className={cn(
            "animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 overflow-hidden rounded-md bg-gray-900 px-3 py-1.5 text-xs whitespace-pre-line text-gray-50 dark:bg-gray-50 dark:text-gray-900",
            className,
          )}
          {...props}
        >
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
TooltipComponent.displayName = "TooltipComponent";

export { TooltipComponent };
