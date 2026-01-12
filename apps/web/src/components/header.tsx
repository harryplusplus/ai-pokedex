import Image from 'next/image'
import Link from 'next/link'

import AuthStatus from '@/features/auth/components/auth-status'

export default function Header() {
  return (
    <header className="fixed top-0 right-0 left-0 z-20 flex h-16 items-center justify-end gap-6 bg-black/20 px-6 backdrop-blur-sm">
      <Link
        href="https://github.com/harryplusplus/ai-pokedex"
        target="_blank"
        rel="noopener noreferrer"
        className="transition-opacity hover:opacity-70"
        aria-label="GitHub"
      >
        <div className="flex items-center gap-4">
          <Image
            src="/github.svg"
            alt="GitHub 로고"
            width={24}
            height={24}
            className="h-8 w-8 invert"
          />
          <span className="text-sm text-white">GitHub</span>
        </div>
      </Link>
      <AuthStatus />
    </header>
  )
}
