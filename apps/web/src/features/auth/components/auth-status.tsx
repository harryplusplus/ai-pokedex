'use client'

import { Button } from '@/components/ui/button'

import { useAuth } from '../contexts/auth-context'
import { useAuthSignOut } from '../hooks/use-auth-sign-out'
import ProfileImage from './profile-image'

export default function AuthStatus() {
  const { profile } = useAuth()
  const { mutate: mutateAuthSignOut } = useAuthSignOut()

  const { name } = profile ?? {}
  return (
    <div className="flex w-60 items-center justify-between gap-8">
      <div className="flex items-center justify-start gap-4">
        <ProfileImage />
        {name && <span className="truncate text-sm text-white">{name}</span>}
      </div>
      <div className="flex items-center justify-end">
        {profile && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => mutateAuthSignOut()}
            className="bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
          >
            로그아웃
          </Button>
        )}
      </div>
    </div>
  )
}
