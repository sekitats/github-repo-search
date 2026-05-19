import { searchRepositories } from "./repositories";
import { GitHubApiError, SchemaValidationError } from "./errors";
import type { Result } from "./types";
import type { Repositories } from "./schema";

export async function getRepositories(
  query: string
): Promise<Result<Repositories>> {
  try {
    const data = await searchRepositories(query);

    return {
      ok: true,
      data,
    };
  } catch (e) {
    if (e instanceof GitHubApiError)
      return {
        ok: false,
        error: { kind: "api", message: e.message }
      };
    if (e instanceof SchemaValidationError)
      return {
        ok: false,
        error: { kind: "schema", message: e.message }
      };
    return {
      ok: false,
      error: { kind: "unknown", message: "unknown error" }
    };
  }
}
