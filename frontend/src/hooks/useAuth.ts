import { useEffect, useState } from 'react'

import { getCurrentSession, signInWithSupabase } from '../lib/supabase'

export function useAuth() {
  const [email, setEmail] = useState('demo@northstar.air')
  const [password, setPassword] = useState('password123')
  const [sessionReady, setSessionReady] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    getCurrentSession().then(({ data }) => {
      if (!active) {
        return
      }

      setSessionReady(Boolean(data.session))
      if (data.session?.user?.email) {
        setEmail(data.session.user.email)
      }
    })

    return () => {
      active = false
    }
  }, [])

  const signIn = async () => {
    setAuthError(null)

    try {
      await signInWithSupabase(email, password)
      setSessionReady(true)
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Unable to sign in')
      setSessionReady(false)
    }
  }

  return {
    email,
    setEmail,
    password,
    setPassword,
    sessionReady,
    authError,
    signIn
  }
}
