
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface ColorsAndAccessoriesProps {
  formData: {
    exteriorColor: string;
    interiorColor: string;
    accessories: string;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const ColorsAndAccessories = ({ formData, onChange }: ColorsAndAccessoriesProps) => {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="exteriorColor" className="block text-sm font-medium text-gray-700 mb-1">
          Exterior Color
        </label>
        <Input
          id="exteriorColor"
          name="exteriorColor"
          type="text"
          value={formData.exteriorColor}
          onChange={onChange}
          required
          placeholder="Midnight Black"
        />
      </div>
      <div>
        <label htmlFor="interiorColor" className="block text-sm font-medium text-gray-700 mb-1">
          Interior Color
        </label>
        <Input
          id="interiorColor"
          name="interiorColor"
          type="text"
          value={formData.interiorColor}
          onChange={onChange}
          required
          placeholder="Black Leather"
        />
      </div>
      <div>
        <label htmlFor="accessories" className="block text-sm font-medium text-gray-700 mb-1">
          Additional Equipment/Accessories
        </label>
        <Textarea
          id="accessories"
          name="accessories"
          value={formData.accessories}
          onChange={onChange}
          placeholder="List any additional equipment or accessories..."
          className="min-h-[200px]"
        />
      </div>
    </div>
  );
};

export default ColorsAndAccessories;
