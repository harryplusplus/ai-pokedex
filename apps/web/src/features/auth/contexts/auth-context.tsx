'use client'

import { getAccessToken, parseAccessToken } from '@/lib/auth'
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import { toast } from 'sonner'
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

  const authRefresh = useCallback(() => {
    mutateAuthRefresh(undefined, {
      onError: () => {
        setProfile(null)
      },
      onSuccess: () => {
        const accessToken = getAccessToken()
        if (!accessToken) {
          throw new Error('Invalid refresh output.')
        }

        try {
          setProfile(parseAccessToken(accessToken))
        } catch (_e) {
          toast.error(`Failed to parse profile.`)
        }
      },
    })
  }, [mutateAuthRefresh])

  useEffect(() => {
    authRefresh()

    const interval = setInterval(() => {
      authRefresh()
    }, _12MinutesInMs)

    return () => clearInterval(interval)
  }, [authRefresh])

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
