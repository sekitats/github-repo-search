export class GitHubApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "GitHubApiError";
  }
}

export function isGitHubApiError(e: unknown): e is Error & { status: number } {
  return e instanceof Error && e.name === "GitHubApiError";
}