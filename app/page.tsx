import { getRepositories } from "@/lib/github/service";
import { RepoList } from "@/features/search/components/RepoList";
import { SearchForm } from "@/features/search/components/SearchForm";
import { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";

type Props = {
  searchParams: Promise<{ q?: string }>;
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
          <Results searchParams={searchParams} />
        </Suspense>
      </main>
    </div>
  );
}

async function Results({ searchParams }: Props) {
  const query = (await searchParams)?.q ?? "";

  if (!query) return null;

  const res = await getRepositories(query);
  if (res.error) {
    return <p>{res.error.message}</p>
  }
  if (res.data.items.length === 0) {
    return <p>リポジトリがありません。</p>
  }

  return <RepoList items={res.data.items} />;

}