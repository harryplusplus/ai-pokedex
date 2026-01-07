import { ReactNode } from 'react'

export default function Main({ children }: { children: ReactNode }) {
  return <main className="relative z-10 h-screen pt-16">{children}</main>
}
