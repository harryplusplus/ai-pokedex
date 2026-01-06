'use client'

import GoogleSignInButton, {
  GoogleSignInResponse,
} from '@/features/google-sign-in/components/google-sign-in-button'
import { useTRPC } from '@/lib/trpc-query'
import { toPrintable } from '@/lib/utils'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

export default function SignInButtons() {
  const trpc = useTRPC()
  const authSignIn = useMutation(trpc.auth.signIn.mutationOptions())

  const onGoogleSignInResponse = (response: GoogleSignInResponse) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('google sign in response:', response)
    }

    const { credential = '' } = response

    const parsedIdToken = parseGoogleIdToken(credential)
    if (parsedIdToken) {
      authSignIn.mutate({
        idToken: credential,
      })
    }
  }

  return <GoogleSignInButton onResponse={onGoogleSignInResponse} />
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
