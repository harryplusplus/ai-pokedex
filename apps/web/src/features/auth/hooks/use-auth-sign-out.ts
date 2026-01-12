import { useMutation } from '@tanstack/react-query'

import { setAccessToken } from '@/lib/auth'
import { API_URL } from '@/lib/constants'
import { parseErrorResponse } from '@/lib/utils'

import { useAuth } from '../contexts/auth-context'

export function useAuthSignOut() {
  const { setProfile } = useAuth()

  return useMutation<void>({
    mutationKey: ['auth', 'signout'],
    mutationFn: async () => {
      const res = await fetch(`${API_URL}/auth/signout`, {
        method: 'POST',
        credentials: 'include',
      })

      if (!res.ok) {
        const { message } = await parseErrorResponse(res)
        throw new Error(message)
      }
    },
    onSuccess: () => {
      setAccessToken(null)
      setProfile(null)
    },
  })
}
