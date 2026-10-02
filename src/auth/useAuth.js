import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(() => Boolean(supabase))

  useEffect(() => {
    if (!supabase) return undefined
    supabase.auth.getSession().then(({ data, error }) => {
      if (!error) setUser(data.session?.user ?? null)
      setLoading(false)
    })
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null))
    return () => subscription.subscription.unsubscribe()
  }, [])

  const signInWithGoogle = async () => {
    if (!supabase) throw new Error('Google sign-in is not configured yet.')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
    if (error) throw error
  }
  const signOut = async () => {
    if (!supabase) return
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }
  return { user, loading, signInWithGoogle, signOut }
}
