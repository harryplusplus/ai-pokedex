'use client'

import { useEffect, useRef } from 'react'
import { GOOGLE_CLIENT_ID } from '../constants'
import { useGoogleSignIn } from '../contexts/google-sign-in-context'

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: {
            client_id: string
            callback: (response: { credential?: string }) => void
          }) => void
          prompt: () => void
          renderButton: (element: HTMLElement, options: unknown) => void
        }
      }
    }
  }
}

export function GoogleSignInButton() {
  const { status } = useGoogleSignIn()
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (status !== 'success' || !containerRef.current || !window.google) {
      return
    }

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response) => {
        try {
          const { credential = '' } = response
          const {
            name = '',
            given_name = '',
            picture = '',
          } = JSON.parse(atob(credential.split('.')[1])) as {
            name?: string
            given_name?: string
            picture?: string
          }
        } catch (e) {
          // TODO: toast
          console.error(e)
        }
      },
    })

    window.google.accounts.id.renderButton(containerRef.current, {})

    window.google.accounts.id.prompt()
  }, [status])

  return <div ref={containerRef}></div>
}
