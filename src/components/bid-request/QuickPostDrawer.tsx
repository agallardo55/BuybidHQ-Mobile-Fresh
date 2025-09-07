
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
      <SheetContent className="w-full max-w-md sm:max-w-lg p-0 flex flex-col">
        <ScrollArea className="flex-1">
          <div className="p-6">
            <QuickPostForm onClose={onClose} />
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default QuickPostDrawer;
