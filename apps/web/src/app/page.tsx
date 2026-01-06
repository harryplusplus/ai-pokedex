import TrpcQueryProviders from '@/components/trpc-query-providers'
import { GoogleSingInProvider } from '@/features/google-sign-in/contexts/google-sign-in-context'
import SignInButtonSection from '@/features/sign-in/components/sign-in-button-section'
import Image from 'next/image'

export default function Home() {
  return (
    <main className="relative min-h-screen w-full">
      <div className="z-0">
        <Image
          src="/nature-1767703122177-7577.jpg"
          alt="sign-in-background"
          fill
          priority
          className="object-cover brightness-80"
        />
      </div>
      <div className="relative z-10 flex flex-col items-center justify-start">
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
        <TrpcQueryProviders>
          <GoogleSingInProvider>
            <SignInButtonSection />
          </GoogleSingInProvider>
        </TrpcQueryProviders>
      </div>
    </main>
  )
}
