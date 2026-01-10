import { setAccessToken } from '@/lib/auth'
import { API_URL } from '@/lib/constants'
import { ContentTypeJson, parseErrorResponse } from '@/lib/utils'
import { AuthSignIn, AuthSignInOutput } from '@repo/common'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAuth } from '../contexts/auth-context'

export function useAuthSignIn() {
  const { setProfile } = useAuth()

  return useMutation<AuthSignInOutput, Error, AuthSignIn>({
    mutationKey: ['auth', 'sign-in'],
    mutationFn: async (input) => {
      const res = await fetch(`${API_URL}/auth/sign-in`, {
        method: 'POST',
        body: JSON.stringify(input),
        headers: {
          'Content-Type': 'application/json',
        } satisfies ContentTypeJson,
      })

      if (!res.ok) {
        const { message } = await parseErrorResponse(res)
        throw new Error(message)
      }

      return (await res.json()) as AuthSignInOutput
    },
    onError: () => {
      setAccessToken(null)
      setProfile(null)
    },
    onSuccess: ({ accessToken }) => {
      setAccessToken(accessToken)

      try {
        const { name = '', image = '' } = JSON.parse(
          atob(accessToken.split('.')[1]),
        ) as {
          name?: string
          image?: string
        }

        setProfile({ name, image })
      } catch (_e) {
        toast.error(`Failed to parse profile.`)
      }
    },
  })
}
