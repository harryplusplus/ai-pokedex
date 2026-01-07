'use client'

import { useTRPC } from '@/lib/trpc-query'
import { toPrintable } from '@/lib/utils'
import { useMutation } from '@tanstack/react-query'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { GOOGLE_CLIENT_ID } from '../constants'
import GoogleSignInButton from './google-sign-in-button'

export default function GoogleSignInIsland() {
  const [isLoaded, setIsLoaded] = useState(false)
  const hiddenButtonRef = useRef<HTMLDivElement>(null)

  const trpc = useTRPC()
  const { mutate: mutateAuthSignIn } = useMutation(
    trpc.auth.signIn.mutationOptions(),
  )

  const onResponse = useCallback(
    (response: google.accounts.id.CredentialResponse) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('Google sign in response:', response)
      }

      const { credential = '' } = response

      const parsedIdToken = parseGoogleIdToken(credential)
      if (parsedIdToken) {
        mutateAuthSignIn({
          idToken: credential,
        })
      }
    },
    [mutateAuthSignIn],
  )

  useEffect(() => {
    if (!hiddenButtonRef.current) {
      return
    }

    const container = hiddenButtonRef.current

    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.onload = () => {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: onResponse,
      })

      window.google.accounts.id.renderButton(container, {
        type: 'icon',
        click_listener: () => {
          if (process.env.NODE_ENV === 'development') {
            console.log('Google sign in button clicked.')
          }
        },
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
    if (hiddenButtonRef.current) {
      const button = hiddenButtonRef.current.querySelector('div[role="button"]')
      if (button && button instanceof HTMLElement) {
        button.click()
        return
      }
    }

    toast.error(`Failed to click Google sign in button.`)
  }

  return (
    <>
      <div ref={hiddenButtonRef} className="hidden"></div>
      <GoogleSignInButton disabled={!isLoaded} onClick={onClick} />
    </>
  )
}

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
