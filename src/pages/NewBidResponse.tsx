
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";

const NewBidResponse = () => {
  const navigate = useNavigate();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle bid submission
    navigate(-1);
  };

  return (
    <div className="container max-w-md mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">New Bid Response</h1>
      
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Bid Amount</Label>
              <Input 
                id="amount" 
                type="number" 
                placeholder="Enter your bid amount"
                min="0"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea 
                id="notes" 
                placeholder="Any additional information about your bid"
              />
            </div>
            
            <div className="flex space-x-3 pt-2">
              <Button 
                type="submit" 
                className="flex-1"
              >
                Submit Bid
              </Button>
              
              <Button 
                type="button"
                variant="outline" 
                className="flex-1"
                onClick={() => navigate(-1)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewBidResponse;
