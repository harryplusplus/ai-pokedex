'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { useGoogleSignIn } from '../context'
import GoogleSignInButton, { GoogleSignInButtonProps } from './button'

export default function GoogleSignInButtonWithSkeleton({
  className,
  ...props
}: GoogleSignInButtonProps) {
  const { status } = useGoogleSignIn()

  const size = 'h-10 w-48'
  return (
    <div className={cn('flex items-center justify-center', size)}>
      <Skeleton
        className={cn(
          'rounded-sm transition-opacity duration-500 ease-in-out',
          size,
          status !== 'success' ? 'opacity-100' : 'opacity-0',
        )}
      />
      <GoogleSignInButton
        {...props}
        className={cn(
          'transition-opacity duration-500 ease-in-out',
          status !== 'success' ? 'opacity-0' : 'opacity-100',
          className,
        )}
      />
    </div>
  )
}
