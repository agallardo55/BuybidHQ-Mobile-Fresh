
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface ErrorCardProps {
  message?: string;
}

const ErrorCard: React.FC<ErrorCardProps> = ({ 
  message = "No vehicle data available. Please go back and try again."
}) => {
  const navigate = useNavigate();
  
  return (
    <div className="container max-w-md mx-auto p-4">
      <Card className="bg-red-50 border-red-200">
        <CardContent className="pt-6">
          <p className="text-red-600">{message}</p>
          <Button 
            onClick={() => navigate(-1)} 
            className="mt-4 w-full"
            variant="outline"
          >
            Go Back
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ErrorCard;
