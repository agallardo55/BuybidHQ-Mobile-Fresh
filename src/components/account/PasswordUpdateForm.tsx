
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePasswordUpdate } from "@/hooks/usePasswordUpdate";

export const PasswordUpdateForm = () => {
  const {
    passwordData,
    isUpdatingPassword,
    showMismatchError,
    handlePasswordChange,
    handlePasswordUpdate,
  } = usePasswordUpdate();

  return (
    <form onSubmit={handlePasswordUpdate} className="space-y-4">
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
            placeholder="Enter new password"
            required
            minLength={6}
          />
          <p className="mt-1 text-sm text-gray-500">
            Password must be at least 6 characters long
          </p>
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
            placeholder="Confirm new password"
            required
            className={cn(
              showMismatchError && "border-red-500 focus:ring-red-500 focus-visible:ring-red-500"
            )}
            minLength={6}
          />
          {showMismatchError && (
            <p className="mt-1 text-sm text-red-500">
              Passwords do not match
            </p>
          )}
        </div>
      </div>

      <Button
        type="submit"
        className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
        disabled={isUpdatingPassword || showMismatchError}
      >
        {isUpdatingPassword ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Updating...
          </>
        ) : (
          "Update Password"
        )}
      </Button>
    </form>
  );
};
