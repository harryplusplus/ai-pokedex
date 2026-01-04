'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { useGoogleSignIn } from '../context'
import GoogleSignInButton, { GoogleSignInButtonProps } from './button'

export default function GoogleSignInButtonWithSkeleton(
  props: GoogleSignInButtonProps,
) {
  const { status } = useGoogleSignIn()

  return (
    <div className="flex h-12 w-48 items-center justify-center">
      {status !== 'success' ? (
        <Skeleton className="h-10 w-48" />
      ) : (
        <GoogleSignInButton {...props} />
      )}
    </div>
  )
}
