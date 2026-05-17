import Image from "next/image";
import Link from "next/link";
import { searchRepositories } from "@/lib/github/repositories";

export default async function Home() {
  const res = await searchRepositories('next.js')

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <header className="flex w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <h1 className="text-2xl font-bold">Github repo search</h1>
      </header>
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <ul className="flex flex-col gap-4">
          {res.items.map((item) => (
            <li key={item.id} className="flex items-center gap-4">
              <Image src={item.owner.avatar_url} alt={item.owner.login} width={40} height={40} className="rounded-full" />
              <Link href={`/repos/${item.owner.login}/${item.name}`}>
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
