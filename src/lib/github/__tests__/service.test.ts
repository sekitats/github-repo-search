import { vi } from "vitest";
import { getRepositories, getRepository } from "../service";
import { GitHubApiError } from "../errors";
import type { Repositories, Repository } from "../schema";

describe("serivce.ts", () => {
  const mockGithubClientSuccess = (data: Repositories | Repository) => {
    vi.spyOn(globalThis, "fetch").mockImplementationOnce(async () => {
      return Response.json(data, { status: 200 });
    });
  };
  const mockGithubClientError = (status: number, error: Error) => {
    vi.spyOn(globalThis, "fetch").mockImplementationOnce(async () => {
      return Response.json({ message: error.message }, { status });
    });
  };
  const mockFetchNetworkError = (error: Error) => {
    vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(error);
  };
  const consoleHideTestErrorLog = (pattern: RegExp) => {
    vi.spyOn(console, "error").mockImplementationOnce((message: string) => {
      if (pattern.test(message)) return;
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetAllMocks();
    vi.restoreAllMocks();
  });

  const createRepositoriesResponse = (count: number) => {
    const items = [...Array(count)].map((_, i) => {
      const index = i + 1;
      return {
        id: index,
        name: `repo-${index}`,
        full_name: `owner-${index}/repo-${index}`,
        owner: {
          avatar_url: "https://avatars.githubusercontent.com/u/14985020?v=4",
          login: `owner-${index}`,
        },
        language: index % 2 === 0 ? "JavaScript" : "TypeScript",
        stargazers_count: index * 10000,
        watchers_count: index * 1000,
        forks_count: index * 100,
        open_issues_count: index * 10,
        unknown_field: true,
      };
    });

    return {
      total_count: count,
      incomplete_results: false,
      items,
    };
  };

  describe("getRepositories", () => {
    describe("success", () => {
      it("page, perPageを渡さない場合、デフォルト値で呼ばれること", async () => {
        const testData = createRepositoriesResponse(10);
        mockGithubClientSuccess(testData);

        await getRepositories("next.js");

        expect(globalThis.fetch).toHaveBeenCalledWith(
          "https://api.github.com/search/repositories?q=next.js&per_page=10&page=1",
          {
            headers: {
              Accept: "application/vnd.github.v3+json",
            },
            next: {
              revalidate: 3600,
              tags: ["repositories:search", "repositories:search:next.js"],
            },
          },
        );
      });

      it("ページネーションのパラメータが正しく渡されること", async () => {
        const testData = createRepositoriesResponse(5);
        mockGithubClientSuccess(testData);

        await getRepositories("next.js", { page: 2, perPage: 5 });

        expect(globalThis.fetch).toHaveBeenCalledWith(
          "https://api.github.com/search/repositories?q=next.js&per_page=5&page=2",
          {
            headers: {
              Accept: "application/vnd.github.v3+json",
            },
            next: {
              revalidate: 3600,
              tags: ["repositories:search", "repositories:search:next.js"],
            },
          },
        );
      });

      it("zod の parse によって不要なフィールドが取り除かれること", async () => {
        const testData = createRepositoriesResponse(20);
        mockGithubClientSuccess(testData);

        const res = await getRepositories("next.js", { page: 10, perPage: 10 });
        const data = res.data!;

        expect(data.items[0]).not.toHaveProperty("unknown_field");
      });
    });

    describe("error", () => {
      it("403 エラーを RATE_LIMIT_EXCEEDED に正規化する", async () => {
        mockGithubClientError(
          403,
          new GitHubApiError(403, "Rate Limit exceeded"),
        );

        const res = await getRepositories("nextjs");
        expect(res).toEqual({
          error: {
            errorCode: 403,
            message: "APIの利用制限に達しました。",
            type: "RATE_LIMIT_EXCEEDED",
          },
        });
      });

      it("422 エラーを UNPROCESSABLE_ENTITY に正規化する", async () => {
        mockGithubClientError(
          422,
          new GitHubApiError(422, "Validation failed"),
        );

        const res = await getRepositories("test-query");
        expect(res).toEqual({
          error: {
            errorCode: 422,
            message: "検索条件が不正です",
            type: "UNPROCESSABLE_ENTITY",
          },
        });
      });

      it("Github の500 エラーはそのまま返却されること", async () => {
        mockGithubClientError(
          500,
          new GitHubApiError(500, "Internal server error"),
        );

        await expect(getRepositories("nextjs")).rejects.toThrow(
          "Internal server error",
        );
      });

      it("GitHub APIから想定外のデータ構造が返ってきた場合、ZodErrorを投げること", async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        mockGithubClientSuccess({ invalid_key: "corrupted_data" } as any);
        consoleHideTestErrorLog(/ZodError/);

        // getRepositories がエラー（ZodError）を投げることを検証
        await expect(getRepositories("next.js")).rejects.toThrow();
      });

      it("予期せぬエラーはそのまま返却されること", async () => {
        mockFetchNetworkError(new Error("Unknown test error"));
        consoleHideTestErrorLog(/Unknown test error/);

        await expect(getRepositories("nextjs")).rejects.toThrow(
          "Unknown test error",
        );
      });
    });
  });

  describe("getRepository", () => {
    const dummyRepo = {
      id: 1,
      name: "next.js",
      full_name: "vercel/next.js",
      owner: {
        login: "vercel",
        avatar_url: "https://avatars.githubusercontent.com/u/14985020?v=4",
      },
      language: "JavaScript",
      stargazers_count: 100000,
      watchers_count: 10000,
      forks_count: 20000,
      open_issues_count: 500,
      unknown_field: true,
    };
    describe("success", () => {
      it("githubClientが正しいパスで呼ばれること", async () => {
        mockGithubClientSuccess(dummyRepo);

        await getRepository("vercel", "next.js");

        expect(globalThis.fetch).toHaveBeenCalledWith(
          "https://api.github.com/repos/vercel/next.js",
          {
            headers: {
              Accept: "application/vnd.github.v3+json",
            },
            next: {
              revalidate: 60,
              tags: ["repositories:detail:vercel/next.js"],
            },
          },
        );
      });

      it("zod の parse によって不要なフィールドが取り除かれること", async () => {
        mockGithubClientSuccess(dummyRepo);

        const res = await getRepository("vercel", "next.js");
        const data = res.data;

        expect(data).not.toHaveProperty("unknown_field");
      });
    });

    describe("error", () => {
      it("403 エラーを RATE_LIMIT_EXCEEDED に正規化する", async () => {
        mockGithubClientError(
          403,
          new GitHubApiError(403, "Rate Limit exceeded"),
        );

        const res = await getRepository("vercel", "next.js");
        expect(res).toEqual({
          error: {
            errorCode: 403,
            message: "APIの利用制限に達しました。",
            type: "RATE_LIMIT_EXCEEDED",
          },
        });
      });

      it("404 エラーはそのまま返却されること", async () => {
        mockGithubClientError(404, new GitHubApiError(404, "Not Found"));

        await expect(getRepository("owner-x", "repo-x")).rejects.toThrow(
          "NEXT_HTTP_ERROR_FALLBACK;404",
        );
      });

      it("Github の500 エラーはそのまま返却されること", async () => {
        mockGithubClientError(
          500,
          new GitHubApiError(500, "Internal server error"),
        );

        await expect(getRepository("vercel", "nextjs")).rejects.toThrow(
          "Internal server error",
        );
      });

      it("GitHub APIから想定外のデータ構造が返ってきた場合、ZodErrorを投げること", async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        mockGithubClientSuccess({ invalid_key: "corrupted_data" } as any);
        consoleHideTestErrorLog(/ZodError/);

        await expect(getRepository("vercel", "next.js")).rejects.toThrow();
      });

      it("予期せぬエラーはそのまま返却されること", async () => {
        mockFetchNetworkError(new Error("Unknown test error"));
        consoleHideTestErrorLog(/Unknown test error/);

        await expect(getRepository("vercel", "next.js")).rejects.toThrow(
          "Unknown test error",
        );
      });
    });
  });
});
