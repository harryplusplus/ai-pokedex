'use client'

import { cn, toPrintable } from '@/lib/utils'
import { useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { GOOGLE_CLIENT_ID } from '../constants'
import { useGoogleSignIn } from '../context'

export interface GoogleSignInResponse {
  credential?: string
}

export interface GoogleSignInOnResponse {
  (response: GoogleSignInResponse): void
}

interface Props {
  className?: string
  onResponse: GoogleSignInOnResponse
}

export default function GoogleSignInButton({ className, onResponse }: Props) {
  const { status } = useGoogleSignIn()
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (status !== 'success' || !containerRef.current || !window.google) {
      return
    }

    renderButton(containerRef.current, onResponse)
  }, [onResponse, status])

  return <div ref={containerRef} className={cn(className)}></div>
}

function renderButton(parent: HTMLElement, onResponse: GoogleSignInOnResponse) {
  try {
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response) => {
        onResponse(response as GoogleSignInResponse)
      },
    })

    window.google.accounts.id.renderButton(parent, {
      type: 'standard',
    })
  } catch (e) {
    toast.error(`Invalid GIS rendering. error: ${toPrintable(e)}`)
  }
}
