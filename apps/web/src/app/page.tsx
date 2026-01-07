import GoogleSignInIsland from '@/features/google-sign-in/components/google-sign-in-island'

export default function Home() {
  return (
    <div className="flex h-full items-center">
      <div className="flex w-1/2 justify-center">
        <div className="rounded-full bg-black/20 p-1 backdrop-blur-sm">
          <GoogleSignInIsland />
        </div>
      </div>
      <div className="flex w-1/2 justify-center">
        <div className="rounded-2xl bg-black/20 px-1 py-1 backdrop-blur-sm">
          <h1 className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-6xl font-bold text-transparent">
            AI 포켓몬 도감
          </h1>
        </div>
      </div>
    </div>
  )
}
