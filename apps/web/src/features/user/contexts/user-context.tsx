'use client'

import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from 'react'

interface UserContext {
  name?: string
  setName: Dispatch<SetStateAction<string | undefined>>
  picture?: string
  setPicture: Dispatch<SetStateAction<string | undefined>>
}

const UserContext = createContext<UserContext | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [name, setName] = useState<string | undefined>(undefined)
  const [picture, setPicture] = useState<string | undefined>(undefined)

  return (
    <UserContext.Provider value={{ name, setName, picture, setPicture }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser(): UserContext {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('Invalid UserContext.')
  }

  return context
}
