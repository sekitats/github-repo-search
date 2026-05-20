import type { Repository } from "./schema";

export function toRepository(repo: Repository): Repository {
  return {
    id: repo.id,
    name: repo.name,
    full_name: repo.full_name,
    owner: {
      login: repo.owner.login,
      avatar_url: repo.owner.avatar_url,
    },
    language: repo.language,
    stargazers_count: repo.stargazers_count,
    watchers_count: repo.watchers_count,
    forks_count: repo.forks_count,
    open_issues_count: repo.open_issues_count,
  }
}