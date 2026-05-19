"use client";

import { Suspense, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function SearchForm() {
  return (
    <Suspense fallback={<SearchFormFallback />}>
      <SearchFormInner />
    </Suspense>
  );
}

function SearchFormInner() {
  const router = useRouter();
  const initialQuery = useSearchParams().get("q") ?? "";

  const inputRef = useRef<HTMLInputElement>(null);
  const [hasValue, setHasValue] = useState(!!initialQuery);

  const submit = () => {
    const q = inputRef.current?.value.trim();
    if (!q) return;
    router.push(`/?q=${encodeURIComponent(q)}`);
  };

  const clear = () => {
    if (inputRef.current) inputRef.current.value = "";
    setHasValue(false);
    inputRef.current?.focus();
    router.push("/")
  };

  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <Input
          ref={inputRef}
          name="q"
          defaultValue={initialQuery}
          placeholder="リポジトリを検索"
          onChange={(e) => setHasValue(!!e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
        />
        {hasValue && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={clear}
            aria-label="クリア"
            className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      <Button type="button" onClick={submit} disabled={!hasValue}>
        検索
      </Button>
    </div>
  );
}

function SearchFormFallback() {
  return (
    <div className="flex gap-2">
      <Input disabled placeholder="リポジトリを検索" className="flex-1" />
      <Button type="button" disabled>
        検索
      </Button>
    </div>
  );
}