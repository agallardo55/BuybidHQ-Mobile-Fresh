
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ColorPickerProps {
  label: string;
  value: string;
  colors: string[];
  name: string;
  onSelectChange: (value: string, name: string) => void;
}

const ColorPicker = ({ label, value, colors, name, onSelectChange }: ColorPickerProps) => {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <Select value={value} onValueChange={value => onSelectChange(value, name)} name={name}>
        <SelectTrigger id={name} name={name} className="w-full">
          <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
        </SelectTrigger>
        <SelectContent>
          {colors.map(color => (
            <SelectItem key={color} value={color}>
              {color}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ColorPicker;
