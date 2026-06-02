"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

export default function AccountPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <p className="card p-4 text-sm text-slate-500">Loading…</p>;
  }
  if (session?.user) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Account</h1>
        <div className="card p-4 text-sm text-slate-700">
          <p>
            <strong>{session.user.name || session.user.email}</strong>
          </p>
          <p className="text-slate-500">{session.user.email}</p>
        </div>
        <Link href="/favorites" className="btn-secondary w-full">
          View saved spots
        </Link>
        <button
          type="button"
          className="btn-secondary w-full"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          Sign out
        </button>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">Account</h1>
      <p className="text-sm text-slate-600">
        Log in to sync your saved spots across devices.
      </p>
      <Link href="/signin" className="btn-primary w-full">
        Sign in or sign up
      </Link>
    </div>
  );
}
