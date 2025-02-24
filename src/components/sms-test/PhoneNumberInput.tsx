
import { Input } from "@/components/ui/input";
import { usePhoneFormat } from "@/hooks/signup/usePhoneFormat";

interface PhoneNumberInputProps {
  phoneNumber: string;
  setPhoneNumber: (value: string) => void;
}

export const PhoneNumberInput = ({ phoneNumber, setPhoneNumber }: PhoneNumberInputProps) => {
  const { formatPhoneNumber } = usePhoneFormat();

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
  };

  return (
    <div>
      <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
        Test Phone Number
      </label>
      <Input
        id="phoneNumber"
        type="tel"
        value={phoneNumber}
        onChange={handlePhoneNumberChange}
        placeholder="(500) 555-0000"
        className="mb-4"
      />
      <div className="text-sm text-gray-500 space-y-2 mb-4">
        <p>For testing, use these Twilio test numbers:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><code>+15005550000</code> - Simulates successful message</li>
          <li><code>+15005550001</code> - Simulates failed message</li>
          <li><code>+15005550009</code> - Simulates unroutable message</li>
        </ul>
      </div>
    </div>
  );
};
