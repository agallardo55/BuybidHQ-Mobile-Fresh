import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSecurityEvents } from "@/hooks/useSecurityEvents";
import { Monitor, Smartphone, Tablet, MapPin, Clock, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const getDeviceIcon = (userAgent?: string) => {
  if (!userAgent) return Monitor;
  
  const ua = userAgent.toLowerCase();
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
    return Smartphone;
  }
  if (ua.includes('tablet') || ua.includes('ipad')) {
    return Tablet;
  }
  return Monitor;
};

const getDeviceType = (userAgent?: string) => {
  if (!userAgent) return "Unknown Device";
  
  const ua = userAgent.toLowerCase();
  
  // Mobile devices
  if (ua.includes('iphone')) return "iPhone";
  if (ua.includes('android') && ua.includes('mobile')) return "Android Phone";
  if (ua.includes('ipad')) return "iPad";
  if (ua.includes('android')) return "Android Tablet";
  
  // Desktop browsers
  if (ua.includes('chrome')) return "Chrome Browser";
  if (ua.includes('firefox')) return "Firefox Browser";
  if (ua.includes('safari')) return "Safari Browser";
  if (ua.includes('edge')) return "Edge Browser";
  
  return "Unknown Device";
};

export const SessionManager = () => {
  const { userSessions, isLoadingSessions, terminateSession } = useSecurityEvents();

  if (isLoadingSessions) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Active Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">Loading sessions...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Monitor className="h-5 w-5" />
          Active Sessions ({userSessions.length})
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Manage your active login sessions. You can terminate any session that you don't recognize.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {userSessions.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No active sessions found
          </div>
        ) : (
          userSessions.map((session) => {
            const DeviceIcon = getDeviceIcon(session.user_agent);
            const deviceType = getDeviceType(session.user_agent);
            const isCurrentSession = new Date(session.last_activity) > new Date(Date.now() - 5 * 60 * 1000);
            
            return (
              <div
                key={session.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <DeviceIcon className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{deviceType}</h4>
                      {isCurrentSession && (
                        <Badge variant="secondary" className="text-xs">
                          Current Session
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      {session.ip_address && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {session.ip_address}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Last active {formatDistanceToNow(new Date(session.last_activity), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                </div>
                
                {!isCurrentSession && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => terminateSession.mutate(session.id)}
                    disabled={terminateSession.isPending}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Terminate
                  </Button>
                )}
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};