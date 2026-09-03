import Link from "next/link";
import type { ReactNode } from "react";

import { logoutAction } from "@/app/actions/auth";
import { requireAdmin } from "@/lib/auth";

export default async function AdminDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-navy-50">
      <header className="bg-navy-900 text-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-8">
            <Link href="/admin" className="flex flex-col leading-tight">
              <span className="text-[10px] font-semibold tracking-[0.2em] text-gold-400 uppercase">
                Delta Sigma Pi
              </span>
              <span className="text-base font-bold">Admin Dashboard</span>
            </Link>
            <nav className="flex gap-5 text-sm font-medium text-navy-100">
              <Link href="/admin" className="hover:text-gold-400">
                Dashboard
              </Link>
              <Link href="/admin/events" className="hover:text-gold-400">
                Events
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-sm text-navy-200 hover:text-gold-400"
            >
              View public site
            </Link>
            <form action={logoutAction}>
              <button
                type="submit"
                className="rounded-md border border-navy-600 px-3 py-1.5 text-sm font-medium text-navy-100 transition hover:border-gold-500 hover:text-gold-400"
              >
                Log Out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        {children}
      </main>
    </div>
  );
}
