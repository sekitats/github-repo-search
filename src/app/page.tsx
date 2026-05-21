import { getRepositories } from "@/lib/github/service";
import { RepoList } from "@/features/search/components/RepoList";
import { SearchForm } from "@/features/search/components/SearchForm";
import { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";
import { RepoPagination } from "@/features/search/components/RepoPagination";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "GitHub Repo Search",
  description: "GitHubリポジトリを検索するアプリ",
}

type SearchParams = {
  q?: string;
  page?: string;
  per_page?: string;
}
type Props = {
  searchParams: Promise<SearchParams>;
};

export default function TopPage({ searchParams }: Props) {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-12 sm:px-6 sm:py-16">
      <Suspense fallback={<div className="h-12 w-full" />}>
        <SearchForm />
      </Suspense>
      <Suspense fallback={<Spinner />}>
        <SearchResult searchParams={searchParams} />
      </Suspense>
    </main>
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
    return (
      <p className="text-sm text-destructive" role="alert">
        {res.error.message}
      </p>
    );
  }
  if (res.data.items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">リポジトリがありません。</p>
    );
  }

  const totalPages = Math.ceil(res.data.total_count / perPage);

  return (
    <section className="flex w-full flex-col gap-6">
      <RepoList items={res.data.items} />
      <RepoPagination q={query} page={page} totalPages={totalPages} />
    </section>
  );
}