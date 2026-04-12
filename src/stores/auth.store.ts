import { create } from 'zustand'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../supabase/client'

interface AuthState {
  session: Session | null
  user: User | null
  isAdmin: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ error: string | null }>
  logout: () => Promise<void>
  setSession: (session: Session | null) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  isAdmin: false,
  isLoading: true,

  setSession: (session) => set({
    session,
    user: session?.user ?? null,
    isAdmin: !!session,
    isLoading: false,
  }),

  login: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: error.message }
    return { error: null }
  },

  logout: async () => {
    await supabase.auth.signOut()
    set({ session: null, user: null, isAdmin: false })
  },
}))