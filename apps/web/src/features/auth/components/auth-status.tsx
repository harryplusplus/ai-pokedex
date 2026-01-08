'use client'

import Image from 'next/image'
import { useAuth } from '../contexts/auth-context'

export default function AuthStatus() {
  const { profile = {} } = useAuth()
  const { name, picture } = profile

  return (
    <>
      <p>{name}</p>
      {picture && (
        <Image src={picture} alt="profile-picture" fill unoptimized />
      )}
    </>
  )
}
