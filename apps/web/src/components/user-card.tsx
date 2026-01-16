'use client'

import { Button } from '@/components/ui/button'
import { authClient } from '@/lib/auth-client'

import ProfileImage from './profile-image'

export default function UserCard() {
  const { data } = authClient.useSession()

  return (
    <div className="flex w-60 items-center justify-between gap-8">
      <div className="flex items-center justify-start gap-4">
        <ProfileImage />
        {data?.user.name && (
          <span className="truncate text-sm text-white">{data.user.name}</span>
        )}
      </div>
      <div className="flex items-center justify-end">
        {data && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => void authClient.signOut()}
            className="bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
          >
            로그아웃
          </Button>
        )}
      </div>
    </div>
  )
}
