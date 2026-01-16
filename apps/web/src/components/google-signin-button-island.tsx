'use client'

import { useState } from 'react'

import { authClient } from '@/lib/auth-client'

import GoogleSigninButton from './google-signin-button'

export default function GoogleSigninButtonIsland() {
  const [isPending, setIsPending] = useState(false)

  const onClick = async () => {
    setIsPending(true)

    try {
      await authClient.signIn.social({
        provider: 'google',
      })
    } finally {
      setIsPending(false)
    }
  }

  return (
    <GoogleSigninButton disabled={isPending} onClick={() => void onClick()} />
  )
}
