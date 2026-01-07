import Image from 'next/image'

export default function Background() {
  return (
    <div className="fixed inset-0 z-0">
      <Image
        src="/background.png"
        alt="background"
        fill
        priority
        className="object-cover"
      />
    </div>
  )
}
