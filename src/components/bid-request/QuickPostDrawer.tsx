
import React from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
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
      <SheetContent className="w-[400px] sm:w-[400px] overflow-y-auto p-3">
        <QuickPostForm onClose={onClose} />
      </SheetContent>
    </Sheet>
  );
};

export default QuickPostDrawer;
