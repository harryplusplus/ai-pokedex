'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { useGoogleSignIn } from '../context'
import GoogleSignInButton, { GoogleSignInButtonProps } from './button'

export default function GoogleSignInButtonWithSkeleton(
  props: GoogleSignInButtonProps,
) {
  const { status } = useGoogleSignIn()

  const size = 'h-10 w-48'
  return (
    <div className={cn('flex items-center justify-center', size)}>
      {status !== 'success' ? (
        <Skeleton className={cn('rounded-sm', size)} />
      ) : (
        <GoogleSignInButton {...props} />
      )}
    </div>
  )
}
