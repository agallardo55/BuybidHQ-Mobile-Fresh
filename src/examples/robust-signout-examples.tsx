/**
 * Usage Examples for Robust Sign Out Function
 * 
 * This file demonstrates how to use the robust sign out function
 * in different scenarios throughout the application.
 */

import { robustSignOut, quickSignOut, signOutEverywhere, emergencySignOut } from '@/utils/robust-signout';
import { useAuth } from '@/contexts/AuthContext';

// Example 1: Basic sign out in a component
export const LogoutButton = () => {
  const { signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut(); // Uses the robust sign out from AuthContext
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <button onClick={handleLogout} className="logout-btn">
      Sign Out
    </button>
  );
};

// Example 2: Direct usage of robust sign out
export const DirectLogoutExample = () => {
  const handleLogout = async () => {
    const result = await robustSignOut({
      scope: 'global',        // Sign out from all devices
      redirectTo: '/signin',  // Redirect to sign in page
      clearHistory: true      // Prevent back button access
    });

    if (!result.success) {
      console.error('Logout failed:', result.error);
    }
  };

  return (
    <button onClick={handleLogout}>
      Sign Out Everywhere
    </button>
  );
};

// Example 3: Quick sign out (no navigation)
export const QuickLogoutExample = () => {
  const handleQuickLogout = async () => {
    const result = await quickSignOut();
    
    if (result.success) {
      // Handle programmatic navigation
      window.location.href = '/signin';
    }
  };

  return (
    <button onClick={handleQuickLogout}>
      Quick Sign Out
    </button>
  );
};

// Example 4: Emergency sign out
export const EmergencyLogoutExample = () => {
  const handleEmergencyLogout = async () => {
    // Use emergency sign out when normal logout fails
    await emergencySignOut();
  };

  return (
    <button onClick={handleEmergencyLogout} className="emergency-logout">
      Emergency Sign Out
    </button>
  );
};

// Example 5: Sign out with custom redirect
export const CustomRedirectLogout = () => {
  const handleCustomLogout = async () => {
    await robustSignOut({
      scope: 'local',
      redirectTo: '/goodbye',  // Custom redirect page
      clearHistory: false      // Keep navigation history
    });
  };

  return (
    <button onClick={handleCustomLogout}>
      Sign Out & Go to Goodbye Page
    </button>
  );
};

// Example 6: Sign out from all devices
export const SignOutEverywhereExample = () => {
  const handleSignOutEverywhere = async () => {
    const result = await signOutEverywhere();
    
    if (result.success) {
      console.log('Successfully signed out from all devices');
    } else {
      console.error('Failed to sign out everywhere:', result.error);
    }
  };

  return (
    <button onClick={handleSignOutEverywhere}>
      Sign Out From All Devices
    </button>
  );
};

// Example 7: Programmatic sign out (for testing)
export const ProgrammaticLogoutExample = () => {
  const handleProgrammaticLogout = async () => {
    const result = await robustSignOut({
      skipNavigation: true  // Don't navigate, just clean up
    });

    if (result.success) {
      // Handle navigation manually
      console.log('Cleanup complete, navigating...');
      window.location.href = '/signin';
    }
  };

  return (
    <button onClick={handleProgrammaticLogout}>
      Programmatic Sign Out
    </button>
  );
};

// Example 8: Integration with error handling
export const ErrorHandlingLogoutExample = () => {
  const handleLogoutWithErrorHandling = async () => {
    try {
      const result = await robustSignOut({
        scope: 'global',
        redirectTo: '/signin',
        clearHistory: true
      });

      if (!result.success) {
        throw new Error(result.error || 'Unknown logout error');
      }

      // Success handling
      console.log('Logout successful');
      
    } catch (error) {
      console.error('Logout error:', error);
      
      // Fallback to emergency logout
      try {
        await emergencySignOut();
      } catch (emergencyError) {
        console.error('Emergency logout also failed:', emergencyError);
        // Last resort - force reload
        window.location.reload();
      }
    }
  };

  return (
    <button onClick={handleLogoutWithErrorHandling}>
      Sign Out with Error Handling
    </button>
  );
};

// Example 9: Conditional sign out based on user role
export const ConditionalLogoutExample = () => {
  const { user } = useAuth();

  const handleConditionalLogout = async () => {
    if (user?.app_metadata?.app_role === 'super_admin') {
      // Super admins sign out from all devices
      await signOutEverywhere();
    } else {
      // Regular users sign out locally
      await robustSignOut({ scope: 'local' });
    }
  };

  return (
    <button onClick={handleConditionalLogout}>
      {user?.app_metadata?.app_role === 'super_admin' 
        ? 'Sign Out Everywhere' 
        : 'Sign Out'
      }
    </button>
  );
};

// Example 10: Sign out with confirmation
export const ConfirmationLogoutExample = () => {
  const handleLogoutWithConfirmation = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to sign out? This will clear your session.'
    );

    if (confirmed) {
      await robustSignOut();
    }
  };

  return (
    <button onClick={handleLogoutWithConfirmation}>
      Sign Out (with confirmation)
    </button>
  );
};
