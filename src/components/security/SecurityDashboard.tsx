import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSecurityEvents } from "@/hooks/useSecurityEvents";
import { SessionManager } from "./SessionManager";
import { Shield, Activity, AlertTriangle, CheckCircle2, Clock, MapPin, Monitor } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const getEventIcon = (eventType: string) => {
  switch (eventType.toLowerCase()) {
    case 'login':
    case 'signin':
      return CheckCircle2;
    case 'logout':
    case 'signout':
      return Activity;
    case 'password_change':
    case 'password_reset':
      return Shield;
    case 'mfa_enabled':
    case 'mfa_disabled':
      return Shield;
    case 'failed_login':
    case 'suspicious_activity':
      return AlertTriangle;
    default:
      return Activity;
  }
};

const getEventColor = (eventType: string) => {
  switch (eventType.toLowerCase()) {
    case 'login':
    case 'signin':
    case 'mfa_enabled':
      return "text-green-600 dark:text-green-400";
    case 'logout':
    case 'signout':
      return "text-blue-600 dark:text-blue-400";
    case 'password_change':
    case 'password_reset':
      return "text-orange-600 dark:text-orange-400";
    case 'failed_login':
    case 'suspicious_activity':
      return "text-destructive";
    case 'mfa_disabled':
      return "text-yellow-600 dark:text-yellow-400";
    default:
      return "text-muted-foreground";
  }
};

const formatEventType = (eventType: string) => {
  return eventType
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const SecurityDashboard = () => {
  const { securityEvents, isLoadingEvents } = useSecurityEvents();

  return (
    <div className="space-y-6">
      {/* Security Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Overview
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Monitor your account security and recent activity
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {securityEvents.filter(event => 
                  event.event_type.includes('login') && 
                  !event.event_type.includes('failed')
                ).length}
              </div>
              <div className="text-sm text-muted-foreground">Successful Logins</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-destructive">
                {securityEvents.filter(event => 
                  event.event_type.includes('failed')
                ).length}
              </div>
              <div className="text-sm text-muted-foreground">Failed Attempts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {securityEvents.filter(event => 
                  event.event_type.includes('password') || 
                  event.event_type.includes('mfa')
                ).length}
              </div>
              <div className="text-sm text-muted-foreground">Security Changes</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <SessionManager />

      {/* Recent Security Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Security Events
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Your recent security and login activity
          </p>
        </CardHeader>
        <CardContent>
          {isLoadingEvents ? (
            <div className="text-center text-muted-foreground py-8">
              Loading security events...
            </div>
          ) : securityEvents.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No security events recorded
            </div>
          ) : (
            <div className="space-y-4">
              {securityEvents.slice(0, 10).map((event) => {
                const EventIcon = getEventIcon(event.event_type);
                const eventColor = getEventColor(event.event_type);
                
                return (
                  <div
                    key={event.id}
                    className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <EventIcon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${eventColor}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">
                          {formatEventType(event.event_type)}
                        </h4>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        {event.ip_address && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {event.ip_address}
                          </div>
                        )}
                        {event.user_agent && (
                          <div className="flex items-center gap-1">
                            <Monitor className="h-3 w-3" />
                            {event.user_agent.split(' ')[0]}
                          </div>
                        )}
                      </div>
                      
                      {event.details && Object.keys(event.details).length > 0 && (
                        <div className="mt-2">
                          <Badge variant="secondary" className="text-xs">
                            Additional Details Available
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};