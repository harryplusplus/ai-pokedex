import GoogleSignInButtonWithSkeleton from '@/features/google-sign-in/components/button-with-skeleton'
import { GoogleSingInProvider } from '@/features/google-sign-in/context'
import Image from 'next/image'

export default function Home() {
  return (
    <GoogleSingInProvider>
      <main className="flex min-h-screen max-w-full flex-col items-center justify-start">
        <div className="mt-14 lg:mt-10" />
        <Image
          src="/pokemon-2023-ko.webp"
          alt="pokemon-2023-ko"
          width={1000}
          height={257}
          className="h-auto w-84 shrink-0 object-contain"
        />
        <h1 className="text-center text-8xl font-extrabold">
          <span className="bg-gradient-to-b from-[#0099D9] to-[#EC424B] bg-clip-text text-transparent">
            AI 도감
          </span>
        </h1>
        <div className="mb-4" />
        <div className="flex justify-center gap-8">
          <Image
            src="/rotom-phone1.webp"
            alt="rotom-phone1"
            width={449}
            height={599}
            className="h-auto w-40 shrink-0 object-contain"
          />
          <Image
            src="/rotom-phone2.webp"
            alt="rotom-phone2"
            width={444}
            height={1024}
            className="h-auto w-22 shrink-0 object-contain"
          />
        </div>
        <div className="mb-16" />
        <GoogleSignInButtonWithSkeleton />
      </main>
    </GoogleSingInProvider>
  )
}
