import { Suspense } from "react";
import RepositoryDetail from "@/features/search/components/SearchResults";
import { Spinner } from "@/components/ui/spinner";

type Params = {
  owner: string;
  name: string;
}
export default async function RepositoryPage({ params }: { params: Promise<Params> }) {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <Suspense fallback={<Spinner />}>
          <RepositoryDetail searchParams={params} />
        </Suspense>
      </main>
    </div>
  );
}
