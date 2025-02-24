
import { createContext, useContext, useState, ReactNode } from "react"

interface WaitlistContextType {
  showWaitlist: boolean
  setShowWaitlist: (show: boolean) => void
}

const WaitlistContext = createContext<WaitlistContextType | undefined>(undefined)

export function WaitlistProvider({ children }: { children: ReactNode }) {
  const [showWaitlist, setShowWaitlist] = useState(false)

  return (
    <WaitlistContext.Provider value={{ showWaitlist, setShowWaitlist }}>
      {children}
      {showWaitlist && <WaitlistOverlay />}
    </WaitlistContext.Provider>
  )
}

export function useWaitlist() {
  const context = useContext(WaitlistContext)
  if (context === undefined) {
    throw new Error("useWaitlist must be used within a WaitlistProvider")
  }
  return context
}
