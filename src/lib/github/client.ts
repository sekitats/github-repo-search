import { GitHubApiError } from "./errors";

const BASE_URL = "https://api.github.com";

type GithubClientOptions = {
  revalidate?: number;
  tags?: string[];
};

export const githubClient = async (
  path: string,
  options?: GithubClientOptions,
): Promise<unknown> => {
  const res = await fetch(`${BASE_URL}/${path}`, {
    headers: {
      Accept: "application/vnd.github.v3+json",
    },
    next: {
      revalidate: options?.revalidate,
      tags: options?.tags,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new GitHubApiError(res.status, JSON.stringify(data));
  }

  return data;
};
