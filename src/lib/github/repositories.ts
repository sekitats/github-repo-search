import { githubClient } from "./client";
import { type Repositories, RepositoriesSchema, RepositorySchema } from "./schema";

export async function searchRepositories(query: string, page: number = 1, limit: number = 10): Promise<Repositories> {
  const params = new URLSearchParams({
    q: query,
    per_page: limit.toString(),
    page: page.toString()
  })
  const path = `search/repositories?${params.toString()}`;
  const data = await githubClient(path, {
    revalidate: 3600,
    tags: ["repositories:search", `repositories:search:${query}`],
  });
  const parsed = RepositoriesSchema.parse(data);

  return {
    total_count: parsed.total_count,
    incomplete_results: parsed.incomplete_results,
    items: parsed.items,
  }
}

export async function fetchRepository(owner: string, name: string) {
  const path = `repos/${owner}/${name}`;
  const data = await githubClient(path, {
    revalidate: 60,
    tags: [`repositories:detail:${owner}/${name}`],
  });
  const parsed = RepositorySchema.parse(data);

  return parsed;
}