
import { useState } from "react";
import { QuickBidDetails } from "./types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import DetailsTab from "./DetailsTab";
import ConditionTab from "./ConditionTab";
import ValuesTab from "./ValuesTab";
import { ImageModal } from "./ImageModal";

interface DetailPageProps {
  vehicle: QuickBidDetails;
  onBackToOffer: () => void;
}

const DetailPage = ({ vehicle, onBackToOffer }: DetailPageProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <Tabs defaultValue="details">
      <div className="sticky top-0 bg-white z-10 p-4 shadow-md">
        <div className="flex items-center space-x-4">
          <img
            src={vehicle.vehicle_images[0]}
            alt="Vehicle thumbnail"
            className="w-16 h-16 rounded-lg object-cover cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => setIsModalOpen(true)}
          />
          <div>
            <h1 className="text-lg font-black text-gray-900">{vehicle.vehicle_year} {vehicle.vehicle_make} {vehicle.vehicle_model}</h1>
            <p className="text-sm font-bold text-gray-500">{vehicle.vehicle_vin} - {Number(vehicle.vehicle_mileage).toLocaleString()} Miles</p>
          </div>
        </div>
        <TabsList className="grid w-full grid-cols-3 mt-4">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="condition">Condition</TabsTrigger>
          <TabsTrigger value="values">Values</TabsTrigger>
        </TabsList>
      </div>
      <div className="p-4 pb-24">
        <TabsContent value="details">
          <DetailsTab vehicle={vehicle} />
        </TabsContent>
        <TabsContent value="condition">
          <ConditionTab vehicle={vehicle} />
        </TabsContent>
        <TabsContent value="values">
          <ValuesTab vehicle={vehicle} />
        </TabsContent>
      </div>
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white">
        <Button
          className="w-full bg-brand hover:bg-brand/90 text-white rounded-2xl h-14 text-lg font-semibold shadow-lg flex items-center justify-center gap-2"
          onClick={onBackToOffer}
        >
          <ChevronLeft className="h-6 w-6" />
          Back to Vehicle Offer
        </Button>
      </div>

      {/* Image Modal */}
      <ImageModal
        images={vehicle.vehicle_images}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        startIndex={0}
      />
    </Tabs>
  );
};

export default DetailPage;
