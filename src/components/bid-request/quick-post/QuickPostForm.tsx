
import React from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface QuickPostFormProps {
  onClose: () => void;
}

const QuickPostForm = ({ onClose }: QuickPostFormProps) => {
  const { currentUser } = useCurrentUser();

  return (
    <div className="flex justify-center items-center h-64">
      <p className="text-center text-muted-foreground">
        Quick post functionality is currently being updated.
        {currentUser && <span className="block mt-2">Welcome, {currentUser.full_name || currentUser.email}</span>}
      </p>
    </div>
  );
};

export default QuickPostForm;
