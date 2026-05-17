import { repositorySchema } from "./schema";
import { Repository } from "./types";

export function toRepository(res: unknown): Repository {
  const parsed = repositorySchema.safeParse(res);
  if (!parsed.success) {
    console.error(parsed.error);
    throw new Error("Invalid repository data");
  }
  const validated = parsed.data
  return {
    id: validated.id,
    name: validated.name,
    full_name: validated.full_name,
    owner: {
      login: validated.owner.login,
      avatar_url: validated.owner.avatar_url,
    },
    language: validated.language,
    stargazers_count: validated.stargazers_count,
    watchers_count: validated.watchers_count,
    forks_count: validated.forks_count,
    open_issues_count: validated.open_issues_count,
  }
}