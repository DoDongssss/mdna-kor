import { useEffect } from 'react'
import { supabase } from '../supabase/client'
import { useAuthStore } from '../stores/auth.store'

export const useAuth = () => {
  const { setSession, ...store } = useAuthStore()

  useEffect(() => {
    // Get initial session on app load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    // Listen for auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return store
}