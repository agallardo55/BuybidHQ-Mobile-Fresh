
import React from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import QuickPostForm from "./quick-post/QuickPostForm";

interface QuickPostDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const QuickPostDrawer = ({
  isOpen,
  onClose
}: QuickPostDrawerProps) => {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full max-w-sm sm:max-w-md p-0 flex flex-col h-full">
        <div className="p-6 flex-1 flex flex-col min-h-0">
          <QuickPostForm onClose={onClose} />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default QuickPostDrawer;
