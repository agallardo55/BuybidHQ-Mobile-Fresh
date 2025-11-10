
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { User, UserRole } from "@/types/users";
import { AppRole } from "@/types/accounts";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useRef } from "react";

// DIAGNOSTIC: Global tracking for all hook instances
const diagnosticState = {
  activeInstances: 0,
  totalIntervalsCreated: 0,
  totalIntervalsCleared: 0,
  activeIntervals: new Set<number>(),
  intervalFireCounts: new Map<number, number>(),
  queryExecutions: 0,
  queryCompletions: 0,
  queryErrors: 0,
  queryTimeouts: 0,
};

// DIAGNOSTIC: Log diagnostic state periodically
if (typeof window !== 'undefined') {
  setInterval(() => {
    if (diagnosticState.activeInstances > 0 || diagnosticState.activeIntervals.size > 0) {
      console.log('🔍 useCurrentUser DIAGNOSTICS:', {
        activeInstances: diagnosticState.activeInstances,
        activeIntervals: diagnosticState.activeIntervals.size,
        totalCreated: diagnosticState.totalIntervalsCreated,
        totalCleared: diagnosticState.totalIntervalsCleared,
        intervalLeaks: diagnosticState.totalIntervalsCreated - diagnosticState.totalIntervalsCleared,
        queryStats: {
          executions: diagnosticState.queryExecutions,
          completions: diagnosticState.queryCompletions,
          errors: diagnosticState.queryErrors,
          timeouts: diagnosticState.queryTimeouts,
        },
        intervalFireCounts: Array.from(diagnosticState.intervalFireCounts.entries()).map(([id, count]) => ({ id, count })),
      });
    }
  }, 5000); // Log every 5 seconds
}

export interface UserData {
  id: string;
  email: string;
  role: UserRole;
  app_role: AppRole;
  full_name: string | null;
  mobile_number: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  account_id: string | null;
  dealership_id: string | null;
  dealer_name: string | null;
  business_phone: string | null;
  business_email: string | null;
  phone_carrier: string | null;
  profile_photo: string | null;
  bid_request_email_enabled: boolean;
  bid_request_sms_enabled: boolean;
  license_number?: string | null;
}

// DIAGNOSTIC: Set to true to disable the hook for testing
const DISABLE_HOOK_FOR_TESTING = false;

export const useCurrentUser = () => {
  // DIAGNOSTIC: Track mount/unmount
  const instanceId = useRef(Math.random().toString(36).substr(2, 9));
  const mountTime = useRef(Date.now());
  
  useEffect(() => {
    diagnosticState.activeInstances++;
    console.log(`🔍 useCurrentUser: Hook MOUNTED [${instanceId.current}]`, {
      instanceId: instanceId.current,
      activeInstances: diagnosticState.activeInstances,
      timestamp: new Date().toISOString(),
    });
    
    return () => {
      diagnosticState.activeInstances--;
      const lifetime = Date.now() - mountTime.current;
      console.log(`🔍 useCurrentUser: Hook UNMOUNTED [${instanceId.current}]`, {
        instanceId: instanceId.current,
        activeInstances: diagnosticState.activeInstances,
        lifetime: `${lifetime}ms`,
        timestamp: new Date().toISOString(),
      });
    };
  }, []);

  const navigate = useNavigate();
  const { user: authUser } = useAuth();

  // DIAGNOSTIC: Early return if disabled for testing
  if (DISABLE_HOOK_FOR_TESTING) {
    console.warn('🔍 useCurrentUser: HOOK DISABLED FOR TESTING');
    return { currentUser: null, isLoading: false };
  }

  const { data: currentUser, isLoading } = useQuery<UserData | null>({
    queryKey: ['currentUser', authUser?.id],
    queryFn: async ({ signal, queryKey }) => {
      // DIAGNOSTIC: Track query execution
      const queryId = diagnosticState.queryExecutions++;
      const queryStartTime = Date.now();
      console.log(`🔍 useCurrentUser: Query STARTED [${instanceId.current}]`, {
        queryId,
        instanceId: instanceId.current,
        authUserId: authUser?.id,
        timestamp: new Date().toISOString(),
      });

      const startTime = Date.now();
      const MAX_QUERY_TIME = 3000;
      
      // CRITICAL: Declare outside try block so finally can access it
      let checkTimeout: NodeJS.Timeout | null = null;
      const queryAbortController = new AbortController();
      const intervalId = Math.random();
      
      try {
        // DIAGNOSTIC: Track interval creation
        diagnosticState.totalIntervalsCreated++;
        diagnosticState.activeIntervals.add(intervalId);
        diagnosticState.intervalFireCounts.set(intervalId, 0);
        
        checkTimeout = setInterval(() => {
          // DIAGNOSTIC: Track interval fires
          const currentCount = diagnosticState.intervalFireCounts.get(intervalId) || 0;
          diagnosticState.intervalFireCounts.set(intervalId, currentCount + 1);
          
          if (Date.now() - startTime > MAX_QUERY_TIME) {
            console.warn(`🔍 useCurrentUser: Query timeout [${instanceId.current}]`, {
              queryId,
              instanceId: instanceId.current,
              intervalFires: currentCount + 1,
              elapsed: Date.now() - startTime,
            });
            diagnosticState.queryTimeouts++;
            
            if (checkTimeout) {
              clearInterval(checkTimeout);
              checkTimeout = null;
              diagnosticState.totalIntervalsCleared++;
              diagnosticState.activeIntervals.delete(intervalId);
              diagnosticState.intervalFireCounts.delete(intervalId);
            }
            queryAbortController.abort();
          }
        }, 100);
        
        if (!authUser?.id) {
          console.log(`🔍 useCurrentUser: No auth user [${instanceId.current}]`);
          if (checkTimeout) {
            clearInterval(checkTimeout);
            checkTimeout = null;
            diagnosticState.totalIntervalsCleared++;
            diagnosticState.activeIntervals.delete(intervalId);
            diagnosticState.intervalFireCounts.delete(intervalId);
          }
          return null;
        }

        console.log(`🔍 useCurrentUser: Fetching user data [${instanceId.current}]`, {
          queryId,
          userId: authUser.id,
        });
        
        if (signal?.aborted) {
          console.log(`🔍 useCurrentUser: Request aborted before start [${instanceId.current}]`);
          if (checkTimeout) {
            clearInterval(checkTimeout);
            checkTimeout = null;
            diagnosticState.totalIntervalsCleared++;
            diagnosticState.activeIntervals.delete(intervalId);
            diagnosticState.intervalFireCounts.delete(intervalId);
          }
          return null;
        }

        const userQueryTimeout = setTimeout(() => queryAbortController.abort(), 5000);
        
        let userData, userError;
        try {
          const result = await supabase
            .from('buybidhq_users')
            .select('*')
            .eq('id', authUser.id)
            .abortSignal(queryAbortController.signal)
            .maybeSingle();
          userData = result.data;
          userError = result.error;
        } finally {
          clearTimeout(userQueryTimeout);
        }
        
        if (signal?.aborted || queryAbortController.signal.aborted) {
          console.log(`🔍 useCurrentUser: Request aborted after fetch [${instanceId.current}]`);
          if (checkTimeout) {
            clearInterval(checkTimeout);
            checkTimeout = null;
            diagnosticState.totalIntervalsCleared++;
            diagnosticState.activeIntervals.delete(intervalId);
            diagnosticState.intervalFireCounts.delete(intervalId);
          }
          return null;
        }

        if (userError) {
          console.error(`🔍 useCurrentUser: Error fetching user [${instanceId.current}]`, {
            queryId,
            error: userError.message,
          });
          
          if (userError.message?.includes('AbortError') || 
              userError.message?.includes('aborted') ||
              userError.code === '20') {
            console.log(`🔍 useCurrentUser: Request aborted/timed out [${instanceId.current}]`);
          } else {
            diagnosticState.queryErrors++;
          }
        }

        if (!userData) {
          console.log(`🔍 useCurrentUser: No user data, using fallback [${instanceId.current}]`);
          
          if (authUser) {
            const fallbackUser: UserData = {
              id: authUser.id,
              email: authUser.email || '',
              role: 'basic',
              app_role: (authUser.app_metadata?.app_role as AppRole) || 'member',
              full_name: authUser.user_metadata?.full_name || null,
              mobile_number: authUser.user_metadata?.mobile_number || null,
              address: authUser.user_metadata?.address || null,
              city: authUser.user_metadata?.city || null,
              state: authUser.user_metadata?.state || null,
              zip_code: authUser.user_metadata?.zip_code || null,
              account_id: authUser.app_metadata?.account_id || null,
              dealership_id: authUser.app_metadata?.dealership_id || null,
              dealer_name: null,
              business_phone: null,
              business_email: null,
              license_number: null,
              phone_carrier: authUser.user_metadata?.phone_carrier || null,
              profile_photo: authUser.user_metadata?.profile_photo || null,
              bid_request_email_enabled: true,
              bid_request_sms_enabled: false
            };
            
            if (checkTimeout) {
              clearInterval(checkTimeout);
              checkTimeout = null;
              diagnosticState.totalIntervalsCleared++;
              diagnosticState.activeIntervals.delete(intervalId);
              diagnosticState.intervalFireCounts.delete(intervalId);
            }
            
            diagnosticState.queryCompletions++;
            const queryDuration = Date.now() - queryStartTime;
            console.log(`🔍 useCurrentUser: Query COMPLETED (fallback) [${instanceId.current}]`, {
              queryId,
              duration: `${queryDuration}ms`,
            });
            
            return fallbackUser;
          }
          
          if (checkTimeout) {
            clearInterval(checkTimeout);
            checkTimeout = null;
            diagnosticState.totalIntervalsCleared++;
            diagnosticState.activeIntervals.delete(intervalId);
            diagnosticState.intervalFireCounts.delete(intervalId);
          }
          
          diagnosticState.queryCompletions++;
          return null;
        }

        if (signal?.aborted) {
          console.log(`🔍 useCurrentUser: Request aborted before dealership fetch [${instanceId.current}]`);
          if (checkTimeout) {
            clearInterval(checkTimeout);
            checkTimeout = null;
            diagnosticState.totalIntervalsCleared++;
            diagnosticState.activeIntervals.delete(intervalId);
            diagnosticState.intervalFireCounts.delete(intervalId);
          }
          return null;
        }

        let dealershipInfo = {
          dealer_name: null,
          business_phone: null,
          business_email: null,
          license_number: null
        };

        if (userData.app_role === 'member') {
          const dealerController = new AbortController();
          const dealerTimeout = setTimeout(() => dealerController.abort(), 3000);
          try {
            const { data: individualDealer } = await supabase
              .from('individual_dealers')
              .select('business_name, business_phone, business_email, license_number')
              .eq('user_id', userData.id)
              .abortSignal(dealerController.signal)
              .maybeSingle();
            
            if (individualDealer) {
              dealershipInfo = {
                dealer_name: individualDealer.business_name,
                business_phone: individualDealer.business_phone,
                business_email: individualDealer.business_email,
                license_number: individualDealer.license_number
              };
            }
          } catch (e) {
            console.warn(`🔍 useCurrentUser: Dealership query failed [${instanceId.current}]`, e);
          } finally {
            clearTimeout(dealerTimeout);
          }
        } else if (userData.dealership_id) {
          const dealerController = new AbortController();
          const dealerTimeout = setTimeout(() => dealerController.abort(), 3000);
          try {
            const { data: dealership } = await supabase
              .from('dealerships')
              .select('dealer_name, business_phone, business_email, license_number')
              .eq('id', userData.dealership_id)
              .abortSignal(dealerController.signal)
              .maybeSingle();
            
            if (dealership) {
              dealershipInfo = dealership;
            }
          } catch (e) {
            console.warn(`🔍 useCurrentUser: Dealership query failed [${instanceId.current}]`, e);
          } finally {
            clearTimeout(dealerTimeout);
          }
        }

        if (signal?.aborted) {
          console.log(`🔍 useCurrentUser: Request aborted before super admin check [${instanceId.current}]`);
          if (checkTimeout) {
            clearInterval(checkTimeout);
            checkTimeout = null;
            diagnosticState.totalIntervalsCleared++;
            diagnosticState.activeIntervals.delete(intervalId);
            diagnosticState.intervalFireCounts.delete(intervalId);
          }
          return null;
        }

        let isSuperAdmin = false;
        try {
          const superAdminPromise = supabase
            .rpc('is_super_admin', { checking_user_id: userData.id })
            .then(({ data, error }) => {
              if (error) {
                console.warn(`🔍 useCurrentUser: Super admin check error [${instanceId.current}]`, error);
                return false;
              }
              return data || false;
            });
          
          const timeoutPromise = new Promise<false>((resolve) => 
            setTimeout(() => resolve(false), 3000)
          );
          
          isSuperAdmin = await Promise.race([superAdminPromise, timeoutPromise]);
        } catch (e) {
          console.warn(`🔍 useCurrentUser: Super admin check failed [${instanceId.current}]`, e);
        }

        const formattedUser: UserData = {
          id: userData.id,
          email: userData.email,
          role: isSuperAdmin ? 'admin' as UserRole : userData.role as UserRole,
          app_role: isSuperAdmin ? 'super_admin' : (userData.app_role as AppRole),
          full_name: userData.full_name,
          mobile_number: userData.mobile_number,
          address: userData.address,
          city: userData.city,
          state: userData.state,
          zip_code: userData.zip_code,
          account_id: userData.account_id,
          dealership_id: userData.dealership_id,
          dealer_name: dealershipInfo.dealer_name,
          business_phone: dealershipInfo.business_phone,
          business_email: dealershipInfo.business_email,
          license_number: dealershipInfo.license_number,
          phone_carrier: userData.phone_carrier,
          profile_photo: userData.profile_photo || null,
          bid_request_email_enabled: userData.bid_request_email_enabled ?? true,
          bid_request_sms_enabled: userData.bid_request_sms_enabled ?? false
        };

        // DIAGNOSTIC: Ensure interval is cleared on success
        if (checkTimeout) {
          clearInterval(checkTimeout);
          checkTimeout = null;
          diagnosticState.totalIntervalsCleared++;
          diagnosticState.activeIntervals.delete(intervalId);
          diagnosticState.intervalFireCounts.delete(intervalId);
        }
        
        diagnosticState.queryCompletions++;
        const queryDuration = Date.now() - queryStartTime;
        console.log(`🔍 useCurrentUser: Query COMPLETED (success) [${instanceId.current}]`, {
          queryId,
          duration: `${queryDuration}ms`,
        });
        
        return formattedUser;
      } catch (error: any) {
        // DIAGNOSTIC: Track errors
        diagnosticState.queryErrors++;
        
        if (checkTimeout) {
          clearInterval(checkTimeout);
          checkTimeout = null;
          diagnosticState.totalIntervalsCleared++;
          diagnosticState.activeIntervals.delete(intervalId);
          diagnosticState.intervalFireCounts.delete(intervalId);
        }
        
        if (error?.message?.includes('AbortError') || error?.message?.includes('aborted')) {
          console.log(`🔍 useCurrentUser: Query aborted cleanly [${instanceId.current}]`);
          if (authUser) {
            return {
              id: authUser.id,
              email: authUser.email || '',
              role: 'basic',
              app_role: (authUser.app_metadata?.app_role as AppRole) || 'member',
              full_name: authUser.user_metadata?.full_name || null,
              mobile_number: authUser.user_metadata?.mobile_number || null,
              address: authUser.user_metadata?.address || null,
              city: authUser.user_metadata?.city || null,
              state: authUser.user_metadata?.state || null,
              zip_code: authUser.user_metadata?.zip_code || null,
              account_id: authUser.app_metadata?.account_id || null,
              dealership_id: authUser.app_metadata?.dealership_id || null,
              dealer_name: null,
              business_phone: null,
              business_email: null,
              license_number: null,
              phone_carrier: authUser.user_metadata?.phone_carrier || null,
              profile_photo: authUser.user_metadata?.profile_photo || null,
              bid_request_email_enabled: true,
              bid_request_sms_enabled: false
            };
          }
          return null;
        }
        
        console.error(`🔍 useCurrentUser: Query ERROR [${instanceId.current}]`, {
          queryId,
          error: error?.message || error,
        });
        
        if (authUser) {
          return {
            id: authUser.id,
            email: authUser.email || '',
            role: 'basic',
            app_role: (authUser.app_metadata?.app_role as AppRole) || 'member',
            full_name: authUser.user_metadata?.full_name || null,
            mobile_number: authUser.user_metadata?.mobile_number || null,
            address: authUser.user_metadata?.address || null,
            city: authUser.user_metadata?.city || null,
            state: authUser.user_metadata?.state || null,
            zip_code: authUser.user_metadata?.zip_code || null,
            account_id: authUser.app_metadata?.account_id || null,
            dealership_id: authUser.app_metadata?.dealership_id || null,
            dealer_name: null,
            business_phone: null,
            business_email: null,
            license_number: null,
            phone_carrier: authUser.user_metadata?.phone_carrier || null,
            profile_photo: authUser.user_metadata?.profile_photo || null,
            bid_request_email_enabled: true,
            bid_request_sms_enabled: false
          };
        }
        return null;
      } finally {
        // DIAGNOSTIC: CRITICAL - Always clear interval in finally block
        // This ensures cleanup even if an unexpected error occurs
        if (checkTimeout) {
          clearInterval(checkTimeout);
          checkTimeout = null;
          diagnosticState.totalIntervalsCleared++;
          diagnosticState.activeIntervals.delete(intervalId);
          diagnosticState.intervalFireCounts.delete(intervalId);
        }
      }
    },
    retry: (failureCount, error: any) => {
      console.log(`🔍 useCurrentUser: Retry check [${instanceId.current}]`, {
        failureCount,
        error: error?.message,
      });
      if (error?.message?.includes('AbortError') || 
          error?.message?.includes('aborted') || 
          error?.message?.includes('JWT')) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
    enabled: !!authUser,
    throwOnError: false,
  });

  return { currentUser, isLoading };
};
