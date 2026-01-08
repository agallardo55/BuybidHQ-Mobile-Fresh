import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "./useCurrentUser";
import { toast } from "@/utils/notificationToast";

interface SecurityEvent {
  id: string;
  event_type: string;
  details: any;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

interface UserSession {
  id: string;
  session_token: string;
  device_info: any;
  ip_address?: string;
  user_agent?: string;
  last_activity: string;
  expires_at?: string;
  is_active: boolean;
  created_at: string;
}

export const useSecurityEvents = () => {
  const { currentUser } = useCurrentUser();
  const queryClient = useQueryClient();

  const { data: securityEvents, isLoading: isLoadingEvents } = useQuery({
    queryKey: ["security-events", currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return [];

      const { data, error } = await supabase
        .from("user_security_events")
        .select("*")
        .eq("user_id", currentUser.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as SecurityEvent[];
    },
    enabled: !!currentUser?.id,
  });

  const { data: userSessions, isLoading: isLoadingSessions } = useQuery({
    queryKey: ["user-sessions", currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return [];

      const { data, error } = await supabase
        .from("user_sessions")
        .select("*")
        .eq("user_id", currentUser.id)
        .eq("is_active", true)
        .order("last_activity", { ascending: false });

      if (error) throw error;
      return data as UserSession[];
    },
    enabled: !!currentUser?.id,
  });

  const logSecurityEvent = useMutation({
    mutationFn: async ({
      eventType,
      details = {},
      ipAddress,
      userAgent,
    }: {
      eventType: string;
      details?: any;
      ipAddress?: string;
      userAgent?: string;
    }) => {
      if (!currentUser?.id) throw new Error("User not authenticated");

      const { error } = await supabase.rpc("log_security_event", {
        p_user_id: currentUser.id,
        p_event_type: eventType,
        p_details: details,
        p_ip_address: ipAddress,
        p_user_agent: userAgent,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["security-events"] });
    },
    onError: (error) => {
      console.error("Failed to log security event:", error);
      toast.error("Failed to log security event");
    },
  });

  const terminateSession = useMutation({
    mutationFn: async (sessionId: string) => {
      const { error } = await supabase
        .from("user_sessions")
        .update({ is_active: false })
        .eq("id", sessionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-sessions"] });
      toast.success("Session terminated successfully");
    },
    onError: (error) => {
      console.error("Failed to terminate session:", error);
      toast.error("Failed to terminate session");
    },
  });

  return {
    securityEvents: securityEvents || [],
    userSessions: userSessions || [],
    isLoadingEvents,
    isLoadingSessions,
    logSecurityEvent,
    terminateSession,
  };
};