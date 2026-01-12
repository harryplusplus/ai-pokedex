import { AccessTokenDto, AuthSignIn } from '@repo/common'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

import { parseAccessToken, setAccessToken } from '@/lib/auth'
import { API_URL } from '@/lib/constants'
import { ContentTypeJson, parseErrorResponse } from '@/lib/utils'

import { useAuth } from '../contexts/auth-context'

export function useAuthSignIn() {
  const { setProfile } = useAuth()

  return useMutation<AccessTokenDto, Error, AuthSignIn>({
    mutationKey: ['auth', 'signin'],
    mutationFn: async (input) => {
      const res = await fetch(`${API_URL}/auth/signin`, {
        method: 'POST',
        body: JSON.stringify(input),
        headers: {
          'Content-Type': 'application/json',
        } satisfies ContentTypeJson,
        credentials: 'include',
      })

      if (!res.ok) {
        const { message } = await parseErrorResponse(res)
        throw new Error(message)
      }

      return (await res.json()) as AccessTokenDto
    },
    onError: () => {
      setAccessToken(null)
      setProfile(null)
    },
    onSuccess: ({ accessToken }) => {
      setAccessToken(accessToken)

      try {
        setProfile(parseAccessToken(accessToken))
      } catch (_e) {
        toast.error(`Failed to parse profile.`)
      }
    },
  })
}
