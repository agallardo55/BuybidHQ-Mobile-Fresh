
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useAccountForm } from "@/hooks/useAccountForm";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const SubscriptionTab = () => {
  const { formData, setFormData, handleChange } = useAccountForm();
  const { toast } = useToast();

  const handleSubscriptionChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      subscriptionType: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Updated subscription data:", formData);
    toast({
      title: "Subscription updated",
      description: "Your subscription details have been successfully updated.",
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <label htmlFor="subscriptionType" className="block text-sm font-medium text-gray-700 mb-1">
          Subscription Plan
        </label>
        <Select onValueChange={handleSubscriptionChange} value={formData.subscriptionType}>
          <SelectTrigger>
            <SelectValue placeholder="Select plan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="basic">Basic Plan</SelectItem>
            <SelectItem value="pro">Pro Plan</SelectItem>
            <SelectItem value="enterprise">Enterprise Plan</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-900">Payment Method</h3>
        
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label htmlFor="cardName" className="block text-sm font-medium text-gray-700 mb-1">
              Cardholder Name
            </label>
            <Input
              id="cardName"
              name="cardName"
              type="text"
              value={formData.cardName}
              onChange={handleChange}
              placeholder="John Doe"
            />
          </div>

          <div>
            <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Card Number
            </label>
            <Input
              id="cardNumber"
              name="cardNumber"
              type="text"
              value={formData.cardNumber}
              onChange={handleChange}
              placeholder="**** **** **** ****"
              maxLength={19}
            />
          </div>

          <div>
            <label htmlFor="cardExpiry" className="block text-sm font-medium text-gray-700 mb-1">
              Expiry Date
            </label>
            <Input
              id="cardExpiry"
              name="cardExpiry"
              type="text"
              value={formData.cardExpiry}
              onChange={handleChange}
              placeholder="MM/YY"
              maxLength={5}
            />
          </div>

          <div>
            <label htmlFor="cardCvc" className="block text-sm font-medium text-gray-700 mb-1">
              CVC
            </label>
            <Input
              id="cardCvc"
              name="cardCvc"
              type="text"
              value={formData.cardCvc}
              onChange={handleChange}
              placeholder="123"
              maxLength={3}
            />
          </div>
        </div>

        <div className="pt-4">
          <Button
            type="button"
            onClick={handleSubmit}
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            Update Payment Details
          </Button>
        </div>
      </div>
      <div className="h-8 border-t mt-6"></div>
    </div>
  );
};
