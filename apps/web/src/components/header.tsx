export default function Header() {
  return (
    <header className="fixed top-0 right-0 left-0 z-20 flex h-16 items-center justify-end gap-6 bg-black/20 px-6 backdrop-blur-sm">
      <a
        href="https://linkedin.com/in/yourname"
        target="_blank"
        className="text-white transition-colors hover:text-blue-400"
      >
        <div className="h-6 w-6" />
      </a>
      <a
        href="https://github.com/yourname"
        target="_blank"
        className="text-white transition-colors hover:text-gray-300"
      >
        <div className="h-6 w-6" />
      </a>
    </header>
  )
}
