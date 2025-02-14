
import { Badge } from "@/components/ui/badge"
import { Clock } from "lucide-react"

interface ComingSoonBadgeProps {
  className?: string
}

export function ComingSoonBadge({ className }: ComingSoonBadgeProps) {
  return (
    <Badge 
      variant="secondary" 
      className={`flex items-center gap-1 px-1.5 py-0.5 text-[10px] bg-accent text-white rounded-full whitespace-nowrap ${className}`}
    >
      <Clock size={10} className="animate-pulse" />
      Soon
    </Badge>
  )
}
