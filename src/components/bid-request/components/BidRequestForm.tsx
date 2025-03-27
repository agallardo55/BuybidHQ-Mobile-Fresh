
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SendHorizontal } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { toast } from "sonner";

interface BidRequestFormProps {
  onSubmit: () => void;
  isSubmitting: boolean;
}

const BidRequestForm: React.FC<BidRequestFormProps> = ({ onSubmit, isSubmitting }) => {
  const [notes, setNotes] = useState("");
  const [selectedBuyer, setSelectedBuyer] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedBuyer) {
      toast.error("Please select a buyer");
      return;
    }
    
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-3">Notes</h2>
        <Textarea
          placeholder="Add any additional information about your bid request..."
          className="min-h-24 resize-none"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
      
      <div>
        <h2 className="text-xl font-bold mb-3">Select Buyer</h2>
        <Select value={selectedBuyer} onValueChange={setSelectedBuyer}>
          <SelectTrigger>
            <SelectValue placeholder="Select a buyer" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="buyer1">ABC Motors</SelectItem>
            <SelectItem value="buyer2">XYZ Dealership</SelectItem>
            <SelectItem value="buyer3">123 Auto Group</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Button 
        type="submit" 
        className="w-full bg-blue-600 hover:bg-blue-700 h-12"
        disabled={isSubmitting}
      >
        <SendHorizontal className="mr-2 h-5 w-5" />
        Submit Bid Request
      </Button>
      
      <p className="text-center text-gray-500 text-sm">
        After submission, dealers will contact you with offers
      </p>
    </form>
  );
};

export default BidRequestForm;
