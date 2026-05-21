"use client";

import { useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function SearchForm() {
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
    <div className="flex gap-3">
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
          className="h-12 rounded-lg px-4 text-base md:text-base"
        />
        {hasValue && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={clear}
            aria-label="クリア"
            className="absolute right-2 inset-y-0 my-auto h-8 w-8 transition-none active:translate-y-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      <Button
        type="button"
        onClick={submit}
        disabled={!hasValue}
        className="h-12 rounded-lg px-6 text-base"
      >
        検索
      </Button>
    </div>
  );
}