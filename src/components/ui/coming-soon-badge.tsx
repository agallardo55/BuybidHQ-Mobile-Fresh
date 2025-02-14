
import { Badge } from "@/components/ui/badge"
import { Clock } from "lucide-react"

interface ComingSoonBadgeProps {
  className?: string
}

export function ComingSoonBadge({ className }: ComingSoonBadgeProps) {
  return (
    <Badge 
      variant="secondary" 
      className={`animate-fade-in flex items-center gap-2 bg-accent/10 text-accent ${className}`}
    >
      <Clock size={12} className="animate-pulse" />
      Coming Soon
    </Badge>
  )
}
