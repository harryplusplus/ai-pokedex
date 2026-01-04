import { GoogleSignInButton } from '@/features/google-sign-in/components/google-sign-in-button'
import { GoogleSingInProvider } from '@/features/google-sign-in/contexts/google-sign-in-context'

export default function Home() {
  return (
    <GoogleSingInProvider>
      <main>
        <GoogleSignInButton />
      </main>
    </GoogleSingInProvider>
  )
}
