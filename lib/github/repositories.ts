import { cacheLife } from "next/cache";
import { githubClient } from "./client";
import { Repository, Repositories } from "./types";
import { toRepository } from "./adapter";

export async function searchRepositories(query: string, page: number = 1, limit: number = 10): Promise<Repositories> {
  'use cache'
  cacheLife('hours');
  const params = new URLSearchParams({
    q: query,
    per_page: limit.toString(),
    page: page.toString()
  })
  const path = `search/repositories?${params.toString()}`;
  const data = await githubClient<Repositories>(path);

  return {
    total_count: data.total_count,
    incomplete_results: data.incomplete_results,
    items: data.items.map(toRepository),
  }
}

export async function getRepository(owner: string, name: string) {
  'use cache'
  cacheLife('minutes');
  const path = `repos/${owner}/${name}`;
  const data = await githubClient<Repository>(path);

  return toRepository(data)
}