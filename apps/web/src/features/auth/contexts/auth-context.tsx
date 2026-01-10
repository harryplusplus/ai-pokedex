'use client'

import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from 'react'
import { useAuthRefresh } from '../hooks/use-auth-refresh'

const _12MinutesInMs = 12 * 60 * 1000

interface Profile {
  name?: string
  image?: string
}

interface AuthContext {
  profile: Profile | null
  setProfile: Dispatch<SetStateAction<Profile | null>>
}

const AuthContext = createContext<AuthContext | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const { mutate: mutateAuthRefresh } = useAuthRefresh()

  useEffect(() => {
    mutateAuthRefresh()

    const interval = setInterval(() => {
      mutateAuthRefresh()
    }, _12MinutesInMs)

    return () => clearInterval(interval)
  }, [mutateAuthRefresh])

  return (
    <AuthContext.Provider value={{ profile, setProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContext {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('Invalid AuthContext.')
  }

  return context
}
