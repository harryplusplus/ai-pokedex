import TrpcQueryProviders from '@/components/trpc-query-providers'
import { Toaster } from '@/components/ui/sonner'
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
      <body className="antialiased">
        <TrpcQueryProviders>{children}</TrpcQueryProviders>
        <Toaster />
      </body>
    </html>
  )
}
