'use client'

import Image from 'next/image'
import { useAuth } from '../contexts/auth-context'

export default function ProfileImage() {
  const { profile } = useAuth()
  const { image } = profile ?? {}

  return (
    <div className="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded-full">
      {image && <Image src={image} alt="profile-image" fill />}
    </div>
  )
}
