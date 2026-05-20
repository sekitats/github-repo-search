const BASE_URL = "https://api.github.com";

export const githubClient = async (
  path: string,
  option?: RequestInit
): Promise<unknown> => {
  const res = await fetch(`${BASE_URL}/${path}`, {
    ...option,
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  })

  return res.json();
}