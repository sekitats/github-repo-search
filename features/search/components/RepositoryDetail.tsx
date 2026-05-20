import Image from "next/image";
import { getRepository } from "@/lib/github/service";

type Props = {
  searchParams: Promise<{ owner: string; name: string }>
}

export default async function RepositoryDetail({ searchParams }: Props) {
  const { owner, name } = await searchParams
  const result = await getRepository(owner, name)

  if (result.error) {
    return <div>Error: {result.error.message}</div>
  }

  return (
    <div className="grid gap-4">
      <div className="flex items-center gap-4">
        <Image src={result.data.owner.avatar_url} alt={result.data.owner.login} width={40} height={40} className="rounded-full" />
        <div className="text-2xl font-bold">{result.data.full_name}</div>
      </div>

      <div>
        <div>Star数: {result.data.stargazers_count}</div>
        <div>Watchers数: {result.data.watchers_count}</div>
        <div>Forks数: {result.data.forks_count}</div>
        <div>Open Issues数: {result.data.open_issues_count}</div>
      </div>
    </div>
  )
}