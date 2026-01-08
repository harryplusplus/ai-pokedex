'use client'

import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from 'react'

interface Profile {
  name?: string
  picture?: string
}

interface AuthContext {
  profile?: Profile
  setProfile: Dispatch<SetStateAction<Profile | undefined>>
}

const AuthContext = createContext<AuthContext | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | undefined>(undefined)

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
