import { searchRepositories, fetchRepository } from "./repositories";
import { GitHubApiError } from "./errors";
import { ERROR_MESSAGE, GithubApiErrorType, Result } from "./types";
import type { Repositories, Repository } from "./schema";
import { notFound } from "next/navigation";

export async function getRepositories(
  query: string,
  options?: { page: number; perPage: number }
): Promise<Result<Repositories, GithubApiErrorType>> {
  try {
    const data = await searchRepositories(query, options?.page, options?.perPage);
    return { data };
  } catch (e) {
    if (e instanceof GitHubApiError) {
      switch(e.status) {
        case 403:
          return {
            error: { 
              type: 'RATE_LIMIT_EXCEEDED',
              errorCode: e.status,
              message: ERROR_MESSAGE.RATE_LIMIT_EXCEEDED
            }
          };
        case 422:
          return {
            error: {
              type: 'UNPROCESSABLE_ENTITY',
              errorCode: e.status,
              message: ERROR_MESSAGE.UNPROCESSABLE_ENTITY
            }
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
  name: string
): Promise<Result<Repository, GithubApiErrorType>> {
  try {
    const data = await fetchRepository(owner, name);
    return { data };
  } catch (e) {
    if (e instanceof GitHubApiError) {
      switch(e.status) {
        case 403:
          return {
            error: { 
              type: 'RATE_LIMIT_EXCEEDED', 
              errorCode: e.status,
              message: ERROR_MESSAGE.RATE_LIMIT_EXCEEDED
            }
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
