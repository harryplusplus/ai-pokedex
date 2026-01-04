'use client'

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react'

interface PendingContext {
  status: 'pending'
}

interface ErrorContext {
  status: 'error'
  error: Error | undefined
}

interface SuccessContext {
  status: 'success'
}

type GoogleSignInContext = PendingContext | ErrorContext | SuccessContext

const GoogleSignInContext = createContext<GoogleSignInContext | null>(null)

export function GoogleSingInProvider({ children }: { children?: ReactNode }) {
  const [status, setStatus] = useState<'pending' | 'error' | 'success'>(
    'pending',
  )
  const [error, setError] = useState<Error | undefined>(undefined)

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.onload = () => {
      setStatus('success')
    }

    script.onerror = (_, __, ___, ____, e) => {
      setStatus('error')
      setError(e)
    }

    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  const context: GoogleSignInContext = {
    status,
    error,
  }

  return (
    <GoogleSignInContext.Provider value={context}>
      {children}
    </GoogleSignInContext.Provider>
  )
}

export function useGoogleSignIn(): GoogleSignInContext {
  const context = useContext(GoogleSignInContext)
  if (!context) {
    throw new Error('Invalid GoogleSignInContext.')
  }

  return context
}
