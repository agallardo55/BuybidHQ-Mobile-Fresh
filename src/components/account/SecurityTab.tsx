
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { usePasswordUpdate } from "@/hooks/usePasswordUpdate";

export const SecurityTab = () => {
  const {
    passwordData,
    isUpdatingPassword,
    handlePasswordChange,
    handlePasswordUpdate,
  } = usePasswordUpdate();

  return (
    <form onSubmit={handlePasswordUpdate} className="space-y-4 sm:space-y-6">
      <div className="space-y-4">
        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
            New Password
          </label>
          <Input
            id="newPassword"
            name="newPassword"
            type="password"
            value={passwordData.newPassword}
            onChange={handlePasswordChange}
            required
            minLength={6}
          />
        </div>
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
            Confirm New Password
          </label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={passwordData.confirmPassword}
            onChange={handlePasswordChange}
            required
            minLength={6}
          />
        </div>
      </div>

      <div className="pt-4">
        <Button
          type="submit"
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
          disabled={isUpdatingPassword}
        >
          {isUpdatingPassword ? "Updating..." : "Update Password"}
        </Button>
      </div>
      <div className="h-8 border-t mt-6"></div>
    </form>
  );
};
