import { GoogleSignInButton } from '@/features/google-sign-in/components/google-sign-in-button'
import { GoogleSingInProvider } from '@/features/google-sign-in/contexts/google-sign-in-context'
import Image from 'next/image'

export default function Home() {
  return (
    <GoogleSingInProvider>
      <main className="flex min-h-screen flex-col items-center justify-center">
        <Image src="/pokedex-dp.webp" alt="pokedex" width={400} height={400} />
        <GoogleSignInButton />
      </main>
    </GoogleSingInProvider>
  )
}
