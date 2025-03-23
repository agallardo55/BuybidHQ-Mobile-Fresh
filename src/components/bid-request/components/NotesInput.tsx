
import React from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface NotesInputProps {
  notes: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const NotesInput = ({ notes, onChange }: NotesInputProps) => {
  return (
    <div className="space-y-1 w-full">
      <Label htmlFor="notes" className="text-sm">Additional Notes</Label>
      <Textarea 
        id="notes" 
        placeholder="Enter any additional details" 
        rows={2} 
        className="resize-none text-sm w-full"
        value={notes}
        onChange={onChange}
      />
    </div>
  );
};

export default NotesInput;
