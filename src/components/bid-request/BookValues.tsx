import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BidRequestFormData, FormErrors } from "./types";
import { formatCurrencyDisplay, extractNumericValue } from "@/utils/currencyUtils";

interface BookValuesProps {
  formData: BidRequestFormData;
  errors: FormErrors;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  showValidation?: boolean;
}

const BookValues = ({ 
  formData, 
  errors, 
  onChange, 
  showValidation = false 
}: BookValuesProps) => {

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numericValue = extractNumericValue(value);
    const formattedValue = numericValue ? formatCurrencyDisplay(numericValue) : '';
    
    onChange({
      ...e,
      target: {
        ...e.target,
        name,
        value: formattedValue
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Book Values</h3>
        <p className="text-muted-foreground text-sm">
          Enter wholesale and retail values from different valuation services
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4 font-medium">Service</th>
              <th className="text-left py-3 px-4 font-medium">Wholesale</th>
              <th className="text-left py-3 px-4 font-medium">Retail</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            <tr>
              <td className="py-4 px-4 font-medium">MMR</td>
              <td className="py-4 px-4">
                <Input
                  name="mmrWholesale"
                  value={formData.mmrWholesale}
                  onChange={handleCurrencyChange}
                  placeholder="$0"
                  className="w-full"
                />
              </td>
              <td className="py-4 px-4">
                <Input
                  name="mmrRetail"
                  value={formData.mmrRetail}
                  onChange={handleCurrencyChange}
                  placeholder="$0"
                  className="w-full"
                />
              </td>
            </tr>
            
            <tr>
              <td className="py-4 px-4 font-medium">KBB</td>
              <td className="py-4 px-4">
                <Input
                  name="kbbWholesale"
                  value={formData.kbbWholesale}
                  onChange={handleCurrencyChange}
                  placeholder="$0"
                  className="w-full"
                />
              </td>
              <td className="py-4 px-4">
                <Input
                  name="kbbRetail"
                  value={formData.kbbRetail}
                  onChange={handleCurrencyChange}
                  placeholder="$0"
                  className="w-full"
                />
              </td>
            </tr>
            
            <tr>
              <td className="py-4 px-4 font-medium">J.D. Power</td>
              <td className="py-4 px-4">
                <Input
                  name="jdPowerWholesale"
                  value={formData.jdPowerWholesale}
                  onChange={handleCurrencyChange}
                  placeholder="$0"
                  className="w-full"
                />
              </td>
              <td className="py-4 px-4">
                <Input
                  name="jdPowerRetail"
                  value={formData.jdPowerRetail}
                  onChange={handleCurrencyChange}
                  placeholder="$0"
                  className="w-full"
                />
              </td>
            </tr>
            
            <tr>
              <td className="py-4 px-4 font-medium">Auction</td>
              <td className="py-4 px-4">
                <Input
                  name="auctionWholesale"
                  value={formData.auctionWholesale}
                  onChange={handleCurrencyChange}
                  placeholder="$0"
                  className="w-full"
                />
              </td>
              <td className="py-4 px-4">
                <Input
                  name="auctionRetail"
                  value={formData.auctionRetail}
                  onChange={handleCurrencyChange}
                  placeholder="$0"
                  className="w-full"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BookValues;