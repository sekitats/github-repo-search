import Image from "next/image";
import Link from "next/link";
import type { Repository } from "@/lib/github/schema";

type Props = {
  items: Repository[];
};

export function RepoList({ items }: Props) {
  return (
    <ul className="flex flex-col gap-3">
      {items.map((item) => (
        <li key={item.id}>
          <Link
            href={`/repos/${item.owner.login}/${item.name}`}
            className="flex items-center gap-4 rounded-xl border border-border bg-card px-5 py-4 transition-colors hover:bg-muted"
          >
            <Image
              src={item.owner.avatar_url}
              alt={item.owner.login}
              width={40}
              height={40}
              className="h-10 w-10 shrink-0 rounded-full border border-border"
            />
            <span className="truncate text-base font-medium tracking-tight text-foreground">
              {item.name}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
