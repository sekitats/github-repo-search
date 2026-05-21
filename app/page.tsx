import { getRepositories } from "@/lib/github/service";
import { RepoList } from "@/features/search/components/RepoList";
import { SearchForm } from "@/features/search/components/SearchForm";
import { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";
import { RepoPagination } from "@/features/search/components/RepoPagination";

type SearchParams = {
  q?: string;
  page?: string;
  per_page?: string;
}
type Props = {
  searchParams: Promise<SearchParams>;
};

export default function Page({ searchParams }: Props) {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <header className="flex w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <h1 className="text-2xl font-bold">Github repo search</h1>
      </header>
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <Suspense fallback={<div className="h-10 w-full" />}>
          <SearchForm />
        </Suspense>
        <Suspense fallback={<Spinner />}>
          <SearchResult searchParams={searchParams} />
        </Suspense>
      </main>
    </div>
  );
}

async function SearchResult({ searchParams }: Props) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const perPage = Number(params.per_page) || 10;
  const query = params.q ?? "";

  if (!query) return null;

  const res = await getRepositories(query, { page, perPage });
  if (res.error) {
    return <p>{res.error.message}</p>
  }
  if (res.data.items.length === 0) {
    return <p>リポジトリがありません。</p>
  }

  const totalPages = Math.ceil(res.data.total_count / perPage);

  return (
    <div className="w-full flex flex-col items-center gap-8">
      <RepoList items={res.data.items} />
      <RepoPagination q={query} page={page} totalPages={totalPages} />
    </div>
  );
}