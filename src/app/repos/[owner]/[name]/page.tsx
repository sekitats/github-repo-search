import { Suspense } from "react";
import RepositoryDetail from "@/features/search/components/RepositoryDetail";
import { Spinner } from "@/components/ui/spinner";

type Params = {
  owner: string;
  name: string;
};
type Props = {
  params: Promise<Params>;
}

export default async function RepositoryPage({ params }: Props) {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-12 sm:px-6 sm:py-16">
      <Suspense fallback={<Spinner />}>
        <RepositoryDetail searchParams={params} />
      </Suspense>
    </main>
  );
}
