
import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

interface QuickPostDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const QuickPostDrawer = ({
  isOpen,
  onClose
}: QuickPostDrawerProps) => {
  return <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle>Quick Post</SheetTitle>
          <SheetDescription>
            Create a quick bid request with minimal details.
          </SheetDescription>
        </SheetHeader>

        <div className="flex justify-center items-center h-64">
          <p className="text-center text-muted-foreground">
            Quick post functionality is currently being updated.
          </p>
        </div>

        <SheetFooter className="pt-2 flex flex-row gap-2 sm:justify-end">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1 sm:flex-initial h-8 text-sm">
            Close
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>;
};

export default QuickPostDrawer;
