import { setAccessToken, useTRPC } from '@/lib/trpc-query'
import { toPrintable } from '@/lib/utils'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAuth } from '../contexts/auth-context'

export function useAuthSignIn() {
  const trpc = useTRPC()
  const { setProfile } = useAuth()

  return useMutation(
    trpc.auth.signIn.mutationOptions({
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
  )
}

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
