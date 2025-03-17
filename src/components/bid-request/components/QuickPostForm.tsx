
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import FormField from "./FormField";
import VinInput from "./VinInput";
import { QuickPostFormData } from "../hooks/useQuickPostForm";

interface QuickPostFormProps {
  formData: QuickPostFormData;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onFetchVinDetails: () => void;
  onCancel: () => void;
}

const QuickPostForm = ({
  formData,
  isLoading,
  onSubmit,
  onChange,
  onFetchVinDetails,
  onCancel
}: QuickPostFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4 mt-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <VinInput
            value={formData.vin}
            onChange={onChange}
            onFetchDetails={onFetchVinDetails}
            isLoading={isLoading}
          />
          
          <FormField
            id="mileage"
            label="Mileage"
            value={formData.mileage}
            onChange={onChange}
            type="number"
            required={true}
            placeholder="Enter mileage"
          />
          
          <FormField
            id="year"
            label="Year"
            value={formData.year}
            onChange={onChange}
            type="text"
            required={false}
            placeholder="Enter year"
          />
          
          <FormField
            id="make"
            label="Make"
            value={formData.make}
            onChange={onChange}
            type="text"
            required={false}
            placeholder="Enter make"
          />
          
          <FormField
            id="model"
            label="Model"
            value={formData.model}
            onChange={onChange}
            type="text"
            required={false}
            placeholder="Enter model"
          />
        </div>
        
        <div className="space-y-4">
          <FormField
            id="trim"
            label="Trim"
            value={formData.trim}
            onChange={onChange}
            type="text"
            required={false}
            placeholder="Enter trim"
          />
          
          <FormField
            id="engineCylinders"
            label="Engine"
            value={formData.engineCylinders}
            onChange={onChange}
            type="text"
            required={false}
            placeholder="Enter engine type"
          />
          
          <FormField
            id="transmission"
            label="Transmission"
            value={formData.transmission}
            onChange={onChange}
            type="text"
            required={false}
            placeholder="Enter transmission"
          />
          
          <FormField
            id="drivetrain"
            label="Drivetrain"
            value={formData.drivetrain}
            onChange={onChange}
            type="text"
            required={false}
            placeholder="Enter drivetrain"
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="reconDetails" className="block text-sm font-medium text-gray-700 mb-1">
          Comments
        </Label>
        <Textarea
          id="reconDetails"
          name="reconDetails"
          value={formData.reconDetails}
          onChange={onChange}
          placeholder="Enter additional comments or reconditioning details"
          className="min-h-[100px]"
        />
      </div>
      
      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button type="submit">
          Create Bid Request
        </Button>
      </div>
    </form>
  );
};

export default QuickPostForm;
