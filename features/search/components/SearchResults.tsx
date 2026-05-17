import Image from "next/image";
import { getRepository } from "@/lib/github/repositories";

type Props = {
  searchParams: Promise<{ owner: string; name: string }>
}

export default async function RepositoryDetail({ searchParams }: Props) {
  const { owner, name } = await searchParams
  const data = await getRepository(owner, name)

  return (
    <div className="grid gap-4">
      <div className="flex items-center gap-4">
        <Image src={data.owner.avatar_url} alt={data.owner.login} width={40} height={40} className="rounded-full" />
        <div className="text-2xl font-bold">{data.full_name}</div>
      </div>

      <div>
          <div>Star数: {data.stargazers_count}</div>
          <div>Watchers数: {data.watchers_count}</div>
          <div>Forks数: {data.forks_count}</div>
          <div>Open Issues数: {data.open_issues_count}</div>
        </div>
    </div>
  )
}