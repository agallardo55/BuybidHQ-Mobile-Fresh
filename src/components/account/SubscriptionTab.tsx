
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
import { useNavigate } from "react-router-dom";

export const SubscriptionTab = () => {
  const { formData, setFormData } = useAccountForm();
  const { toast } = useToast();
  const navigate = useNavigate();

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
      const currentPlan = formData.subscriptionType;

      // If upgrading to Dealership plan, redirect to contact form
      if (currentPlan === "beta-access" || currentPlan === "individual") {
        const contactSection = document.getElementById('contact');
        if (contactSection) {
          toast({
            title: "Contact Sales",
            description: "Please contact our sales team to upgrade to the Dealership plan.",
          });
          contactSection.scrollIntoView({ behavior: 'smooth' });
          return;
        } else {
          // If not on homepage, navigate there first
          navigate('/#contact');
          return;
        }
      }

      // For other upgrades, will use Stripe Checkout
      // TODO: Replace with actual Stripe Checkout Session creation
      // const { url } = await createStripeCheckoutSession({
      //   priceId: getPriceIdForPlan(formData.subscriptionType)
      // });
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

  const getCurrentPlanLabel = () => {
    switch (formData.subscriptionType) {
      case "beta-access":
        return "Beta Access (Free)";
      case "individual":
        return "Individual ($49/month)";
      case "dealership":
        return "Dealership (Custom)";
      default:
        return "Select plan";
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Current Subscription</h3>
        <Select onValueChange={handleSubscriptionChange} value={formData.subscriptionType}>
          <SelectTrigger>
            <SelectValue placeholder={getCurrentPlanLabel()} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="beta-access">Beta Access (Free)</SelectItem>
            <SelectItem value="individual">Individual ($49/month)</SelectItem>
            <SelectItem value="dealership">Dealership (Custom)</SelectItem>
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
