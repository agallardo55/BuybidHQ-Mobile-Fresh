
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
  const { formData, setFormData } = useAccountForm();
  const { toast } = useToast();

  const handleSubscriptionChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      subscriptionType: value,
    }));
  };

  const handleManageSubscription = async () => {
    try {
      // TODO: Replace with actual Stripe Customer Portal creation
      // const { url } = await createStripePortalSession();
      // window.location.href = url;
      toast({
        title: "Coming Soon",
        description: "Subscription management will be available soon.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Unable to access subscription management. Please try again later.",
        variant: "destructive",
      });
    }
  };

  const handleUpgradeSubscription = async () => {
    try {
      // TODO: Replace with actual Stripe Checkout Session creation
      // const { url } = await createStripeCheckoutSession();
      // window.location.href = url;
      toast({
        title: "Coming Soon",
        description: "Subscription upgrades will be available soon.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Unable to process upgrade request. Please try again later.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Current Subscription</h3>
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
        <div className="flex flex-col space-y-2">
          <Button
            type="button"
            onClick={handleUpgradeSubscription}
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            Upgrade Subscription
          </Button>
          <Button
            type="button"
            onClick={handleManageSubscription}
            variant="outline"
            className="w-full"
          >
            Manage Payment Methods
          </Button>
        </div>

        <div className="text-sm text-gray-500">
          <p>
            Manage your subscription and payment methods securely through our payment provider.
            Changes will be reflected immediately in your account.
          </p>
        </div>
      </div>
      <div className="h-8 border-t mt-6"></div>
    </div>
  );
};
