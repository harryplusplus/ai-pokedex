import './globals.css'

import { main } from '@repo/server'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import type { Metadata } from 'next'
import localFont from 'next/font/local'

import Background from '@/components/background'
import Header from '@/components/header'
import Main from '@/components/main'
import TrpcQueryProviders from '@/components/trpc-query-providers'
import { Toaster } from '@/components/ui/sonner'
import { AuthProvider } from '@/features/auth/contexts/auth-context'
import { cn } from '@/lib/utils'

const cookieRunFont = localFont({
  src: '../../public/fonts/CookieRun_Regular.ttf',
  display: 'block',
})

export const metadata: Metadata = {
  title: 'AI 포켓몬 도감',
  description: 'RAG를 활용한 AI 포켓몬 도감.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  void main()

  return (
    <html lang="ko" className="bg-black">
      <body
        className={cn('overflow-y-scroll antialiased', cookieRunFont.className)}
      >
        <TrpcQueryProviders>
          <AuthProvider>
            <Background />
            <Header />
            <Main>{children}</Main>
            <ReactQueryDevtools />
          </AuthProvider>
        </TrpcQueryProviders>
        <Toaster />
      </body>
    </html>
  )
}
