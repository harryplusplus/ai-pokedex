import { useMutation } from '@tanstack/react-query'

import { fetchAuthRefresh } from '@/lib/auth'

export function useAuthRefresh() {
  return useMutation({
    mutationKey: ['auth', 'refresh'],
    mutationFn: () => fetchAuthRefresh(),
  })
}
