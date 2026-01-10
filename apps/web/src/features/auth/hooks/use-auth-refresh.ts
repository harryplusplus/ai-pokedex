import { fetchAuthRefresh } from '@/lib/auth'
import { useMutation } from '@tanstack/react-query'

export function useAuthRefresh() {
  return useMutation<boolean>({
    mutationKey: ['auth', 'refresh'],
    mutationFn: () => fetchAuthRefresh(),
  })
}
