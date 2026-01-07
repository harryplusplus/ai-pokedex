import GoogleSignInButton from '@/features/google-sign-in/components/google-sign-in-button'
import { GoogleSingInProvider } from '@/features/google-sign-in/contexts/google-sign-in-context'

export default function Home() {
  return (
    <GoogleSingInProvider>
      <div className="flex h-full items-center">
        <div className="flex w-1/2 justify-center">
          <div className="rounded-full bg-black/20 p-1 backdrop-blur-sm">
            <GoogleSignInButton />
          </div>
        </div>
        <div className="flex w-1/2 flex-col items-center justify-center gap-6">
          <div className="mb-8 space-y-2 text-center">
            <div className="rounded-2xl bg-black/20 px-1 py-1 backdrop-blur-sm">
              <h1 className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-6xl font-bold text-transparent">
                AI 포켓몬 도감
              </h1>
            </div>
          </div>
        </div>
      </div>
    </GoogleSingInProvider>
  )
}
