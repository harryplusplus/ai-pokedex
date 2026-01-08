'use client'

import { useAuthSignIn } from '@/features/auth/hooks/useAuthSignIn'
import { GOOGLE_CLIENT_ID } from '@/lib/constants'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import GoogleSignInButton from './google-sign-in-button'

export default function GoogleSignInButtonIsland() {
  const [isLoaded, setIsLoaded] = useState(false)
  const hiddenButtonContainerRef = useRef<HTMLDivElement>(null)
  const { mutate: mutateAuthSignIn, isPending: isAuthSignInPending } =
    useAuthSignIn()

  const onResponse = useCallback(
    (response: google.accounts.id.CredentialResponse) => {
      const { credential } = response

      mutateAuthSignIn({
        provider: 'google',
        idToken: credential,
      })
    },
    [mutateAuthSignIn],
  )

  useEffect(() => {
    if (!hiddenButtonContainerRef.current) {
      return
    }

    const hiddenButtonContainer = hiddenButtonContainerRef.current

    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.onload = () => {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: onResponse,
      })

      window.google.accounts.id.renderButton(hiddenButtonContainer, {
        type: 'icon',
      })

      setIsLoaded(true)
    }

    script.onerror = (_, __, ___, ____, e) => {
      toast.error(`Failed to load GIS. error: ${e}`)
    }

    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [onResponse])

  const onClick = () => {
    if (hiddenButtonContainerRef.current) {
      const button =
        hiddenButtonContainerRef.current.querySelector('div[role="button"]')
      if (button && button instanceof HTMLElement) {
        button.click()
        return
      }
    }

    toast.error(`Failed to click Google sign in button.`)
  }

  return (
    <>
      <div ref={hiddenButtonContainerRef} className="hidden"></div>
      <GoogleSignInButton
        disabled={!isLoaded || isAuthSignInPending}
        onClick={onClick}
      />
    </>
  )
}
