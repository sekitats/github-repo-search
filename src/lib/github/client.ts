import { GitHubApiError } from "./errors";

const BASE_URL = "https://api.github.com";

export const githubClient = async (
  path: string,
  option?: RequestInit
): Promise<unknown> => {
  const res = await fetch(`${BASE_URL}/${path}`, {
    ...option,
    headers: {
      Accept: "application/vnd.github.v3+json",
    },
  })

  const data = await res.json();

  if (!res.ok) {
    throw new GitHubApiError(res.status, JSON.stringify(data));
  }

  return data;
}