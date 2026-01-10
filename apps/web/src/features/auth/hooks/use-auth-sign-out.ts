import { API_URL } from '@/lib/constants'
import { parseErrorResponse } from '@/lib/utils'
import { useMutation } from '@tanstack/react-query'

export function useAuthSignOut() {
  return useMutation<void>({
    mutationKey: ['auth', 'sign-out'],
    mutationFn: async () => {
      const res = await fetch(`${API_URL}/auth/sign-in`, {
        method: 'POST',
        credentials: 'include',
      })

      if (!res.ok) {
        const { message } = await parseErrorResponse(res)
        throw new Error(message)
      }
    },
  })
}
