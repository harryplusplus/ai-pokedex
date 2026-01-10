'use client'

import { Button } from '@/components/ui/button'
import { useAuth } from '../contexts/auth-context'
import { useAuthSignOut } from '../hooks/use-auth-sign-out'
import ProfileImage from './profile-image'

export default function AuthStatus() {
  const { profile } = useAuth()
  const { mutate: mutateAuthSignOut } = useAuthSignOut()

  if (!profile) {
    return null
  }

  const { name } = profile

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <ProfileImage />
        {name && <span className="text-sm text-white">{name}</span>}
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => mutateAuthSignOut()}
        className="bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
      >
        로그아웃
      </Button>
    </div>
  )
}
