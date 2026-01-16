'use client'

import Image from 'next/image'

import { authClient } from '@/lib/auth-client'

export default function ProfileImage() {
  const { data } = authClient.useSession()

  return (
    <div className="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded-full">
      {data?.user.image && (
        <Image src={data.user.image} alt="profile-image" fill />
      )}
    </div>
  )
}
