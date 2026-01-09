'use client'

import { useTRPC } from '@/lib/trpc-query'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from 'react'

interface Profile {
  name?: string
  image?: string
}

interface AuthContext {
  profile?: Profile
  setProfile: Dispatch<SetStateAction<Profile | undefined>>
}

const AuthContext = createContext<AuthContext | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | undefined>(undefined)
  const router = useRouter()
  const trpc = useTRPC()
  const { mutate: mutateAuthRefresh } = useMutation(
    trpc.auth.refresh.mutationOptions({
      onError: () => {
        router.push('/')
      },
    }),
  )

  useEffect(() => {
    mutateAuthRefresh({})
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
