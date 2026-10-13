"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Loader2, Lock, ShieldCheck } from "lucide-react";
import { adminLogin, type AdminLoginState } from "@/app/actions";

const initial: AdminLoginState = { ok: false };

export default function AdminLogin({ demo }: { demo: boolean }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(adminLogin, initial);

  useEffect(() => {
    if (state.ok) router.refresh();
  }, [state.ok, router]);

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center px-4 py-20 sm:py-28">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-brand-400/25 bg-brand-500/10">
        <ShieldCheck className="h-6 w-6 text-brand-300" />
      </div>
      <h1 className="font-display mt-6 text-3xl font-extrabold tracking-tight text-white">
        Support Console
      </h1>
      <p className="mt-2 text-center text-sm text-slate-400">
        Restricted to the 1xBet Nigeria support team. Enter the team access code to continue.
      </p>

      <form action={formAction} className="glass top-sheen mt-8 w-full rounded-3xl p-6 sm:p-8">
        <label htmlFor="code" className="label">
          <span>Access code</span>
        </label>
        <div className="relative">
          <Lock className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            id="code"
            name="code"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            required
            className="input pl-10"
          />
        </div>

        {state.error && (
          <p className="field-error mt-3">
            <AlertTriangle className="mt-px h-3.5 w-3.5 shrink-0" />
            {state.error}
          </p>
        )}

        <button type="submit" disabled={pending} className="btn-primary mt-6 w-full">
          {pending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Verifying…
            </>
          ) : (
            "Sign in"
          )}
        </button>

        {demo && (
          <p className="mt-4 rounded-xl border border-amber-400/20 bg-amber-400/[0.06] px-4 py-3 text-center text-[11px] leading-relaxed text-amber-200/80">
            Demo mode — sign in with code{" "}
            <span className="font-mono font-semibold text-amber-200">Demo-2026</span>. Set{" "}
            <span className="font-mono">ADMIN_ACCESS_CODE</span> to replace it before going live.
          </p>
        )}
      </form>
    </div>
  );
}
