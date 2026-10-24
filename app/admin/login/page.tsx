import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import mark from "@/public/brand/src-mark.png";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Sign in" };

const ERRORS: Record<string, string> = {
  not_authorised: "This account does not have access to the admin area.",
};

export default async function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  const { error } = await searchParams;
  const initialError = typeof error === "string" ? ERRORS[error] : undefined;
  return (
    <main className="grid min-h-dvh place-items-center bg-brand-900 p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="inline-grid place-items-center rounded-2xl bg-white p-3 shadow-lg">
            <Image src={mark} alt="" width={56} height={44} priority />
          </span>
          <h1 className="font-display mt-5 text-2xl text-white">SRC Trust Admin</h1>
          <p className="mt-1 text-sm text-white/60">Sri Ranga Charitable Trust</p>
          <p className="mt-1 text-sm italic text-leaf">Grow Together</p>
        </div>
        <div className="rounded-2xl bg-white p-7 shadow-2xl">
          <LoginForm initialError={initialError} />
        </div>
        <p className="mt-6 text-center text-xs text-white/50">
          Authorised trust administrators only. ·{" "}
          <Link href="/" className="underline hover:text-white">
            Back to website
          </Link>
        </p>
      </div>
    </main>
  );
}
