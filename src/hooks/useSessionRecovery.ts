import { useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export const useSessionRecovery = () => {
  const { session, isLoading } = useAuth()
  
  useEffect(() => {
    // Only check for session errors after auth context has loaded
    // AuthContext already handles getSession(), so we just monitor for errors
    if (!isLoading && !session) {
      // Session recovery is handled by AuthContext
      // This hook just monitors for any issues
      console.log('Session recovery: No active session (user may need to sign in)')
    }
  }, [session, isLoading])
}
