
import { X } from "lucide-react"
import { WaitlistForm } from "./WaitlistForm"
import { useWaitlist } from "./WaitlistContext"

export function WaitlistOverlay() {
  const { setShowWaitlist } = useWaitlist()

  return (
    <div className="fixed inset-0 z-50 bg-gradient-radial from-[#325AE7] via-[#2348C4] to-[#1A337A] animate-fade-in">
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="max-w-2xl text-center space-y-8 relative">
          <button
            onClick={() => setShowWaitlist(false)}
            className="absolute -top-4 right-0 text-white/60 hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
            <span className="sr-only">Close</span>
          </button>
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              Coming Soon
            </h1>
            <p className="text-lg md:text-xl text-white/80">
              Join our waitlist to be notified when we launch
            </p>
          </div>
          <WaitlistForm />
        </div>
      </div>
    </div>
  )
}
