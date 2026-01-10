import { API_URL } from '@/lib/constants'
import { setAccessToken, useTRPC } from '@/lib/trpc-query'
import { ContentTypeJson, toPrintable } from '@/lib/utils'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAuth } from '../contexts/auth-context'

export function useAuthSignIn() {
  const trpc = useTRPC()
  const { setProfile } = useAuth()

  return useMutation<{ idToken: string }>({
    mutationKey: ['auth', 'sign-in'],
    mutationFn: async (input) => {
      const res = await fetch(`${API_URL}/auth/sign-in`, {
        method: 'POST',
        body: JSON.stringify(input),
        headers: {
          'Content-Type': 'application/json',
        } satisfies ContentTypeJson,
      })

      if (res.ok) {
        return await res.json()
      }
    },
  })
}

/**
 * 
 * @param accessToken 
 *     trpc.auth.signIn.mutationOptions({
      onError: () => {
        setAccessToken(undefined)
        setProfile(undefined)
      },
      onSuccess: ({ accessToken }) => {
        setAccessToken(accessToken)

        const { name, image } = parsePayload(accessToken) ?? {}
        setProfile({ name, image })
      },
    }),

 * @returns 
 */

function parsePayload(accessToken: string) {
  try {
    const { name = '', image = '' } = JSON.parse(
      atob(accessToken.split('.')[1]),
    ) as {
      name?: string
      image?: string
    }

    return {
      name,
      image,
    }
  } catch (e) {
    toast.error(`Failed to parse access token. error: ${toPrintable(e)}`)
  }
}
