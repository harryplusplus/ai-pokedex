'use client'

import { useAuth } from '@/features/auth/contexts/auth-context'
import { GOOGLE_CLIENT_ID } from '@/lib/constants'
import { setAccessToken, useTRPC } from '@/lib/trpc-query'
import { toPrintable } from '@/lib/utils'
import { useMutation } from '@tanstack/react-query'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import GoogleSignInButton from './google-sign-in-button'

function parseGoogleIdToken(idToken: string) {
  try {
    const { name = '', picture = '' } = JSON.parse(
      atob(idToken.split('.')[1]),
    ) as {
      name?: string
      picture?: string
    }

    return {
      name,
      picture,
    }
  } catch (e) {
    toast.error(`Invalid Google sign in response. error: ${toPrintable(e)}`)
  }
}

export default function GoogleSignInButtonIsland() {
  const [isLoaded, setIsLoaded] = useState(false)
  const hiddenButtonContainerRef = useRef<HTMLDivElement>(null)
  const { setProfile } = useAuth()

  const trpc = useTRPC()
  const { mutate: mutateAuthSignIn } = useMutation(
    trpc.auth.signIn.mutationOptions({
      onSuccess: ({ accessToken }) => {
        setAccessToken(accessToken)
      },
    }),
  )

  const onResponse = useCallback(
    (response: google.accounts.id.CredentialResponse) => {
      const { credential = '' } = response

      const parsedIdToken = parseGoogleIdToken(credential)
      if (parsedIdToken) {
        mutateAuthSignIn(
          {
            provider: 'google',
            idToken: credential,
          },
          {
            onError: () => {
              setProfile(undefined)
            },
            onSuccess: () => {
              const { name, picture } = parsedIdToken
              setProfile({ name, picture })
            },
          },
        )
      }
    },
    [mutateAuthSignIn, setProfile],
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
      <GoogleSignInButton disabled={!isLoaded} onClick={onClick} />
    </>
  )
}
