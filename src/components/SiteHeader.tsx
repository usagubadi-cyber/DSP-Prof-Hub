import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="bg-navy-900 text-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-5 sm:px-6">
        <Link href="/" className="flex flex-col leading-tight">
          <span className="text-xs font-semibold tracking-[0.2em] text-gold-400 uppercase">
            Delta Sigma Pi
          </span>
          <span className="text-lg font-bold sm:text-xl">
            Chapter Events Hub
          </span>
        </Link>
        <Link
          href="/admin"
          className="rounded-md border border-navy-600 px-3 py-1.5 text-sm font-medium text-navy-100 transition hover:border-gold-500 hover:text-gold-400"
        >
          Admin
        </Link>
      </div>
    </header>
  );
}
