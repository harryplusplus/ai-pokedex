'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { useGoogleSignIn } from '../context'
import GoogleSignInButton from './button'

export default function GoogleSignInButtonWithSkeleton() {
  const { status } = useGoogleSignIn()

  return (
    <div className="flex h-12 w-48 items-center justify-center">
      {status !== 'success' ? (
        <Skeleton className="h-10 w-48" />
      ) : (
        <GoogleSignInButton />
      )}
    </div>
  )
}
