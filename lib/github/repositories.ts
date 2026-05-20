import { cacheLife } from "next/cache";
import { githubClient } from "./client";
import { type Repositories, RepositoriesSchema, RepositorySchema } from "./schema";
import { toRepository } from "./adapter";
import { SchemaValidationError } from "./errors";

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
  const parsed = RepositoriesSchema.safeParse(data);

  if (!parsed.success) {
    throw new SchemaValidationError(parsed.error.message);
  }

  return {
    total_count: parsed.data.total_count,
    incomplete_results: parsed.data.incomplete_results,
    items: parsed.data.items.map(toRepository),
  }
}

export async function getRepository(owner: string, name: string) {
  'use cache'
  cacheLife('minutes');
  const path = `repos/${owner}/${name}`;
  const data = await githubClient(path);
  const parsed = RepositorySchema.safeParse(data);

  if (!parsed.success) {
    throw new SchemaValidationError(parsed.error.message);
  }

  return toRepository(parsed.data)
}