
import { Input } from "@/components/ui/input";

interface FormFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  type?: "text" | "number";
  required?: boolean;
  placeholder?: string;
  min?: string;
  showValidation?: boolean;
}

const FormField = ({
  id,
  label,
  value,
  onChange,
  error,
  type = "text",
  required = true,
  placeholder,
  min,
  showValidation = false
}: FormFieldProps) => {
  const isEmpty = required && value === "";
  const showError = error || (showValidation && isEmpty);
  
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <Input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        min={min}
        className={`${showError ? "border-red-500" : ""} focus:ring-1 focus:ring-offset-0 ${
          showError ? "bg-red-50" : ""
        }`}
      />
      {showError && (
        <p className="text-red-500 text-sm mt-1">
          {error || "This field is required"}
        </p>
      )}
    </div>
  );
};

export default FormField;
