
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Welcome to BuybidHQ</h1>
      <p className="text-lg mb-8">
        BuybidHQ allows auto dealers to send, manage, and track buy bids on used vehicles.
      </p>
      
      <div className="space-y-4">
        <Button 
          onClick={() => navigate("/vehicle-details")}
          className="w-full md:w-auto"
        >
          View Vehicle Details
        </Button>
      </div>
    </div>
  );
};

export default Home;
