import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface DropdownFieldProps {
  id: string;
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  showValidation?: boolean;
  disabled?: boolean;
}

const DropdownField = ({
  id,
  label,
  value,
  options,
  onChange,
  error,
  required = true,
  placeholder = "Select...",
  showValidation = false,
  disabled = false
}: DropdownFieldProps) => {
  const isEmpty = required && value === "";
  const showError = error || (showValidation && isEmpty);

  return (
    <div>
      <Label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <Select value={value} onValueChange={onChange} name={id} disabled={disabled}>
        <SelectTrigger id={id} name={id} className="w-full" disabled={disabled}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {showError && (
        <p className="text-red-500 text-sm mt-1">
          {error || "This field is required"}
        </p>
      )}
    </div>
  );
};

export default DropdownField;
