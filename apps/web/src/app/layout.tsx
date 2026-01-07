import Background from '@/components/background'
import Header from '@/components/header'
import Main from '@/components/main'
import TrpcQueryProviders from '@/components/trpc-query-providers'
import { Toaster } from '@/components/ui/sonner'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import type { Metadata } from 'next'
import './globals.css'

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
    <html lang="ko">
      <body className="overflow-y-scroll antialiased">
        <TrpcQueryProviders>
          <Background />
          <Header />
          <Main>{children}</Main>
          <ReactQueryDevtools />
        </TrpcQueryProviders>
        <Toaster />
      </body>
    </html>
  )
}
