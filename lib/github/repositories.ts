import { cacheLife } from "next/cache";
import { githubClient } from "./client";
import { type Repositories, RepositoriesSchema, RepositorySchema } from "./schema";

export async function searchRepositories(query: string, page: number = 1, limit: number = 10): Promise<Repositories> {
  'use cache'
  cacheLife('hours');
  const params = new URLSearchParams({
    q: query,
    per_page: limit.toString(),
    page: page.toString()
  })
  const path = `search/repositories?${params.toString()}`;
  const data = await githubClient(path);
  const parsed = RepositoriesSchema.parse(data);

  return {
    total_count: parsed.total_count,
    incomplete_results: parsed.incomplete_results,
    items: parsed.items,
  }
}

export async function fetchRepository(owner: string, name: string) {
  'use cache'
  cacheLife('minutes');
  const path = `repos/${owner}/${name}`;
  const data = await githubClient(path);
  const parsed = RepositorySchema.parse(data);

  return parsed;
}