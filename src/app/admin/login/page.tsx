import Link from "next/link";

import { LoginForm } from "@/components/admin/LoginForm";

export const metadata = {
  title: "Admin Login | Chapter Events Hub",
};

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen flex-1 items-center justify-center bg-navy-950 px-4">
      <div className="w-full max-w-sm rounded-lg bg-white p-8 shadow-xl">
        <div className="mb-6 text-center">
          <p className="text-xs font-semibold tracking-[0.2em] text-gold-600 uppercase">
            Delta Sigma Pi
          </p>
          <h1 className="mt-1 text-xl font-bold text-navy-900">
            Admin Sign In
          </h1>
        </div>
        <LoginForm />
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-navy-700"
          >
            &larr; Back to public events
          </Link>
        </div>
      </div>
    </main>
  );
}
