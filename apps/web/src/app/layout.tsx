import './globals.css'

import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import type { Metadata } from 'next'
import localFont from 'next/font/local'

import Background from '@/components/background'
import Header from '@/components/header'
import Main from '@/components/main'
import QueryProvider from '@/components/query-provider'
import { Toaster } from '@/components/ui/sonner'
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
  return (
    <html lang="ko" className="bg-black">
      <body
        className={cn('overflow-y-scroll antialiased', cookieRunFont.className)}
      >
        <QueryProvider>
          <Background />
          <Header />
          <Main>{children}</Main>
          <ReactQueryDevtools />
        </QueryProvider>
        <Toaster />
      </body>
    </html>
  )
}
