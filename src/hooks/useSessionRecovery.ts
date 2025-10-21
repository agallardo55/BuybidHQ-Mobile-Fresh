import { useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'

export const useSessionRecovery = () => {
  useEffect(() => {
    const recoverSession = async () => {
      try {
        const { error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Session recovery failed:', error)
          // Don't sign out on session errors - let auth context handle it
          // await supabase.auth.signOut()
          // localStorage.clear()
        }
      } catch (err) {
        console.error('Fatal session error:', err)
        localStorage.clear()
      }
    }

    recoverSession()
  }, [])
}
