import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Session, User } from '@supabase/supabase-js'

import { getSupabase } from '@/lib/supabase'

/**
 * App-wide Supabase Auth state (session present or not).
 *
 * Does NOT load CRM profile fields (fullName, role). Those live in `profiles`
 * and are returned by the Worker via GET /api/me — see hooks/useMe.
 */
export type AuthContextValue = {
  /** Supabase session (access_token, refresh_token, expiry). Null when signed out. */
  session: Session | null
  /** Auth user from session (id, email, metadata). Not the CRM `profiles` row. */
  user: User | null
  /** True until the first getSession() finishes — guards must wait before redirecting. */
  isLoading: boolean
  /** True when session exists. Means "logged in to Supabase", not "role === manager". */
  isAuthenticated: boolean
  /** Clears session; onAuthStateChange will set session to null. */
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

/** Subscribes to Supabase session once for the whole app (login, refresh, sign-out). */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const supabase = getSupabase()
    let mounted = true

    // Restore session after refresh (token read from localStorage by Supabase client).
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return
      setSession(data.session)
      setIsLoading(false)
    })

    // Keep in sync after signIn, signOut, and auto token refresh.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!mounted) return
      setSession(nextSession)
      setIsLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signOut = useCallback(async () => {
    const { error } = await getSupabase().auth.signOut()
    if (error) throw error
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      isLoading,
      isAuthenticated: session !== null,
      signOut,
    }),
    [session, isLoading, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/** Read auth state in any component under AuthProvider (see main.tsx). */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
