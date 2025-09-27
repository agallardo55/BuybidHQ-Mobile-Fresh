
import { Input } from "@/components/ui/input";

interface BuyerInfoSectionProps {
  name: string;
  dealership: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const BuyerInfoSection = ({ name, dealership, onChange }: BuyerInfoSectionProps) => {
  return (
    <>
      <div className="space-y-2">
        <label className="text-sm font-medium">Name</label>
        <Input 
          placeholder="Enter buyer full name"
          name="name"
          value={name}
          onChange={onChange}
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Dealership</label>
        <Input 
          placeholder="Enter dealership name"
          name="dealership"
          value={dealership}
          onChange={onChange}
        />
      </div>
    </>
  );
};

export default BuyerInfoSection;
