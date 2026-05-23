import { isGitHubApiError } from "./errors";
import { ERROR_MESSAGE, GithubApiErrorType, Result } from "./types";
import {
  RepositoriesSchema,
  RepositorySchema,
  type Repositories,
  type Repository,
} from "./schema";
import { notFound } from "next/navigation";
import { githubClient } from "./client";

export type Options = {
  page?: number;
  perPage?: number;
};

export async function getRepositories(
  query: string,
  options?: Options,
): Promise<Result<Repositories, GithubApiErrorType>> {
  try {
    const page = options?.page ?? 1;
    const perPage = options?.perPage ?? 10;
    const params = new URLSearchParams({
      q: query,
      per_page: String(perPage),
      page: String(page),
    });
    const path = `search/repositories?${params.toString()}`;
    const data = await githubClient(path, {
      revalidate: 3600,
      tags: ["repositories:search", `repositories:search:${query}`],
    });
    const parsed = RepositoriesSchema.parse(data);

    return { data: parsed };
  } catch (e) {
    if (isGitHubApiError(e)) {
      switch (e.status) {
        case 403:
          return {
            error: {
              type: "RATE_LIMIT_EXCEEDED",
              errorCode: e.status,
              message: ERROR_MESSAGE.RATE_LIMIT_EXCEEDED,
            },
          };
        case 422:
          return {
            error: {
              type: "UNPROCESSABLE_ENTITY",
              errorCode: e.status,
              message: ERROR_MESSAGE.UNPROCESSABLE_ENTITY,
            },
          };
        default:
          throw e;
      }
    }
    // 予期せぬネットワークエラーなどは throw して error.tsx に任せる
    console.error(e);
    throw e;
  }
}

export async function getRepository(
  owner: string,
  name: string,
): Promise<Result<Repository, GithubApiErrorType>> {
  try {
    const path = `repos/${owner}/${name}`;
    const data = await githubClient(path, {
      revalidate: 60,
      tags: [`repositories:detail:${owner}/${name}`],
    });
    const parsed = RepositorySchema.parse(data);

    return { data: parsed };
  } catch (e) {
    if (isGitHubApiError(e)) {
      switch (e.status) {
        case 403:
          return {
            error: {
              type: "RATE_LIMIT_EXCEEDED",
              errorCode: e.status,
              message: ERROR_MESSAGE.RATE_LIMIT_EXCEEDED,
            },
          };
        case 404:
          // 404の場合はnotFoundを投げる
          notFound();
        default:
          throw e;
      }
    }
    // 予期せぬネットワークエラーなどは throw して error.tsx に任せる
    console.error(e);
    throw e;
  }
}
