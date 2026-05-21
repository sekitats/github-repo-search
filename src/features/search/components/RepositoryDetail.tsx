import Image from "next/image";
import { getRepository } from "@/lib/github/service";

type Props = {
  searchParams: Promise<{ owner: string; name: string }>;
};

export default async function RepositoryDetail({ searchParams }: Props) {
  const { owner, name } = await searchParams;
  const result = await getRepository(owner, name);

  if (result.error) {
    return (
      <p className="text-sm text-destructive" role="alert">
        {result.error.message}
      </p>
    );
  }

  const repo = result.data;

  return (
    <article className="flex flex-col gap-8">
      <header className="flex items-start gap-4">
        <Image
          src={repo.owner.avatar_url}
          alt={repo.owner.login}
          width={56}
          height={56}
          className="h-14 w-14 shrink-0 rounded-full border border-border"
        />
        <div className="flex min-w-0 flex-col gap-1">
          <span className="font-mono text-xs text-muted-foreground">
            {repo.owner.login}
          </span>
          <h1 className="truncate text-2xl font-semibold tracking-tight">
            {repo.name}
          </h1>
          {repo.language && (
            <span className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <span
                aria-hidden
                className="inline-block h-2 w-2 rounded-full bg-foreground"
              />
              {repo.language}
            </span>
          )}
        </div>
      </header>

      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-4">
        <Metric label="Star" value={repo.stargazers_count} />
        <Metric label="Watcher" value={repo.watchers_count} />
        <Metric label="Fork" value={repo.forks_count} />
        <Metric label="Issue" value={repo.open_issues_count} />
      </dl>
    </article>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col gap-1 bg-card px-5 py-4">
      <dt className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd className="text-2xl font-semibold tracking-tight tabular-nums">
        {value.toLocaleString()}
      </dd>
    </div>
  );
}
