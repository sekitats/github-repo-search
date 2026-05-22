"use client";

import Link from "next/link";
import { useEffect } from "react";

import { ERROR_MESSAGE } from "@/lib/github/types";

type ErrorProps = {
  error: Error & { digest?: string };
  unstable_retry: () => void;
};

export default function Error({ error }: ErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-24">
      <div className="w-full max-w-xl text-center">
        <p className="font-mono text-xs uppercase text-[var(--mute)]" style={{ letterSpacing: "0.18em" }}>
          500 · Server Error
        </p>

        <h1
          className="mt-6 text-[48px] font-semibold leading-[48px] text-[var(--ink)]"
          style={{ letterSpacing: "-2.4px" }}
        >
          Something went wrong.
        </h1>

        <p className="mt-4 text-[18px] leading-7 text-[var(--body)]">
          {ERROR_MESSAGE.SERVER_ERROR}
        </p>

        <div className="mt-10 flex items-center justify-center">
          <Link
            href="/"
            className="inline-flex h-12 items-center justify-center rounded-full bg-[var(--ink)] px-6 text-[16px] font-medium text-[var(--canvas)] transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ink)] focus-visible:ring-offset-2"
          >
            ホームへ戻る
          </Link>
        </div>
      </div>
    </main>
  );
}
