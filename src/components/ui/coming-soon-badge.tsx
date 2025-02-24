
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

interface ComingSoonBadgeProps {
  className?: string;
}

export function ComingSoonBadge({
  className
}: ComingSoonBadgeProps) {
  return (
    <Badge variant="secondary" className={`flex items-center gap-1 ${className || ''}`}>
      <Clock className="w-3 h-3" />
      <span>Coming Soon</span>
    </Badge>
  );
}
