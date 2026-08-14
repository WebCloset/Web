import { useCallback, useEffect, useState } from 'react'
import { UserSession, userAuthStorage } from '../services/userAuth'

export function useUserAuth() {
  const [user, setUser] = useState<UserSession | null>(() => userAuthStorage.getSession())

  const refresh = useCallback(() => {
    setUser(userAuthStorage.getSession())
  }, [])

  useEffect(() => {
    const onAuthChange = () => refresh()
    window.addEventListener('user-auth-change', onAuthChange)
    window.addEventListener('storage', onAuthChange)
    return () => {
      window.removeEventListener('user-auth-change', onAuthChange)
      window.removeEventListener('storage', onAuthChange)
    }
  }, [refresh])

  const signOut = useCallback(() => {
    userAuthStorage.clearSession()
    setUser(null)
  }, [])

  return { user, isSignedIn: user != null, refresh, signOut }
}
