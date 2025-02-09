
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BasicVehicleInfo from "./BasicVehicleInfo";
import ColorsAndAccessories from "./ColorsAndAccessories";
import VehicleCondition from "./VehicleCondition";
import VinSection from "./VinSection";
import { Button } from "@/components/ui/button";
import { BidRequestFormData, FormErrors } from "./types";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, UserRound } from "lucide-react";

interface MultiStepFormProps {
  formData: BidRequestFormData;
  errors: FormErrors;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSelectChange: (value: string, name: string) => void;
  selectedBuyers: string[];
  toggleBuyer: (buyerId: string) => void;
  buyers: Array<{
    id: string;
    name: string;
    dealership: string;
    mobile: string;
  }>;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

const MultiStepForm = ({
  formData,
  errors,
  onChange,
  onSelectChange,
  selectedBuyers,
  toggleBuyer,
  buyers,
  searchTerm,
  setSearchTerm,
  onSubmit,
  isSubmitting,
}: MultiStepFormProps) => {
  return (
    <Tabs defaultValue="basic-info" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="basic-info">Basic Info</TabsTrigger>
        <TabsTrigger value="appearance">Appearance</TabsTrigger>
        <TabsTrigger value="condition">Condition</TabsTrigger>
        <TabsTrigger value="buyers">Buyers</TabsTrigger>
      </TabsList>

      <div className="mt-6">
        <TabsContent value="basic-info">
          <div className="space-y-4">
            <VinSection 
              vin={formData.vin}
              onChange={onChange}
              error={errors.vin}
            />
            <BasicVehicleInfo 
              formData={formData}
              errors={errors}
              onChange={onChange}
            />
          </div>
        </TabsContent>

        <TabsContent value="appearance">
          <ColorsAndAccessories 
            formData={formData}
            onChange={onChange}
          />
        </TabsContent>

        <TabsContent value="condition">
          <VehicleCondition 
            formData={formData}
            onChange={onChange}
            onSelectChange={onSelectChange}
          />
        </TabsContent>

        <TabsContent value="buyers">
          <div className="flex-1 border rounded-lg p-2.5">
            {errors.buyers && (
              <p className="text-xs text-red-500 mb-2">{errors.buyers}</p>
            )}
            <div className="relative mb-2">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search buyers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-full text-sm"
              />
            </div>
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {buyers.map((buyer) => (
                  <div
                    key={buyer.id}
                    className="flex items-start space-x-2 p-1.5 rounded hover:bg-gray-50"
                  >
                    <Checkbox
                      id={`buyer-${buyer.id}`}
                      checked={selectedBuyers.includes(buyer.id)}
                      onCheckedChange={() => toggleBuyer(buyer.id)}
                      className="h-4 w-4 mt-0.5"
                    />
                    <div className="flex-1">
                      <label
                        htmlFor={`buyer-${buyer.id}`}
                        className="text-sm font-medium cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <UserRound className="h-4 w-4 text-gray-500" />
                            <span>{buyer.name}</span>
                          </div>
                          <div className="text-gray-500">
                            <span className="text-sm">M: {buyer.mobile}</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-500">{buyer.dealership}</p>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
          <Button 
            onClick={onSubmit}
            className="w-full mt-4 text-sm py-2 bg-custom-blue hover:bg-custom-blue/90"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </TabsContent>
      </div>
    </Tabs>
  );
};

export default MultiStepForm;
