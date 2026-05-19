import Image from "next/image";
import Link from "next/link";
import type { Repository } from "@/lib/github/schema";

type Props = {
  items: Repository[]
}
export function RepoList({ items }: Props) {
  return (
    <ul className="flex flex-col gap-4">
      {items.length === 0 && (
        <li className="text-center text-gray-500">No repositories found</li>
      )}
      {items.map((item) => (
        <li key={item.id} className="flex items-center gap-4">
          <Image src={item.owner.avatar_url} alt={item.owner.login} width={40} height={40} className="rounded-full" />
          <Link href={`/repos/${item.owner.login}/${item.name}`}>
            {item.name}
          </Link>
        </li>
      ))}
    </ul>
  )
}