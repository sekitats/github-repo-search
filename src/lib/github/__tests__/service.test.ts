import { vi } from 'vitest';
import { getRepositories, getRepository } from "../service";
import { GitHubApiError } from '../errors';
import * as client from '../client';
import { Repositories, Repository } from '../schema';

vi.mock('next/cache', () => ({
  cacheLife: vi.fn(),
}));
vi.mock('../client');

describe('serivce.ts', () => {
  const mockGithubClientSuccess = (data: Repositories | Repository) => {
    vi.mocked(client.githubClient).mockResolvedValue(data);
  }
  const mockGithubClientError = (error: Error) => {
    vi.mocked(client.githubClient).mockRejectedValue(error);
  }
  const consoleHideTestErrorLog = (pattern: RegExp) =>{
    vi.spyOn(console, 'error').mockImplementationOnce((message: string) => {
      if (pattern.test(message)) return;
    });
  }

  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetAllMocks();
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
  }

  describe('getRepositories', () => {
    describe('success', () => {

      it('page, perPageを渡さない場合、デフォルト値で呼ばれること', async () => {
        const testData = createRepositoriesResponse(10);
        mockGithubClientSuccess(testData);
        
        await getRepositories('next.js');
        
        expect(client.githubClient).toHaveBeenCalledWith(
          'search/repositories?q=next.js&per_page=10&page=1',
          {
            "revalidate": 3600,
            "tags": [
              "repositories:search",
              "repositories:search:next.js",
            ],
          }
        );
      })

      it('githubClient が正しいパスで呼ばれること', async () => {
        const testData = createRepositoriesResponse(20);
        mockGithubClientSuccess(testData);
        
        await getRepositories('next.js', { page: 2, perPage: 5 });
        
        expect(client.githubClient).toHaveBeenCalledWith(
          'search/repositories?q=next.js&per_page=5&page=2',
          {
            "revalidate": 3600,
            "tags": [
              "repositories:search",
              "repositories:search:next.js",
            ],
          }
        );
      })

      it('zod の parse によって不要なフィールドが取り除かれること', async () => {
        const testData = createRepositoriesResponse(20);
        mockGithubClientSuccess(testData);
        
        const res = await getRepositories('next.js', { page: 10, perPage: 10 });
        const data = res.data!;
        
        expect(data.items[0]).not.toHaveProperty('unknown_field');
      })
    })
  
    describe('error', () => {
      it('403 エラーを RATE_LIMIT_EXCEEDED に正規化する', async () => {
        mockGithubClientError(new GitHubApiError(403, 'Rate Limit exceeded'));
        
        const res = await getRepositories('nextjs');
        expect(res).toEqual({
          error: {
            errorCode: 403,
            message: 'APIの利用制限に達しました。',
            type: "RATE_LIMIT_EXCEEDED"
          }
        })
      })
      
      it('422 エラーを UNPROCESSABLE_ENTITY に正規化する', async () => {
        mockGithubClientError(new GitHubApiError(422, "Validation failed"));
        
        const res = await getRepositories('test-query');
        expect(res).toEqual({
          error: {
            errorCode: 422,
            message: "検索条件が不正です",
            type: "UNPROCESSABLE_ENTITY"
          }
        })
      })

      it('Github の500 エラーはそのまま返却されること', async () => {
        mockGithubClientError(new GitHubApiError(500, "Internal server error"));
        
        await expect(getRepositories('nextjs')).rejects.toThrow("Internal server error");
      })

      it('予期せぬエラーはそのまま返却されること', async () => {
        mockGithubClientError(new Error("Unknown test error"));
        consoleHideTestErrorLog(/Unknown test error/);

        await expect(getRepositories('nextjs')).rejects.toThrow("Unknown test error");
      });
    });
  });


  describe('getRepository', () => {
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
    }
    describe('success', () => {
      it('githubClientが正しいパスで呼ばれること', async () => {
        mockGithubClientSuccess(dummyRepo);

        await getRepository('vercel', 'next.js');

        expect(client.githubClient).toHaveBeenCalledWith(
          'repos/vercel/next.js',
          {
            "revalidate": 60,
            "tags": [
              "repositories:detail:vercel/next.js",
            ],
          }
        );
      });

      it('zod の parse によって不要なフィールドが取り除かれること', async () => {
        mockGithubClientSuccess(dummyRepo);

        const res = await getRepository('vercel', 'next.js');
        const data = res.data;

        expect(data).not.toHaveProperty('unknown_field')
      });
    });

    describe('error', () => {
      it('403 エラーを RATE_LIMIT_EXCEEDED に正規化する', async () => {
        mockGithubClientError(new GitHubApiError(403, 'Rate Limit exceeded'));
        
        const res = await getRepository('vercel', 'next.js');
        expect(res).toEqual({
          error: {
            errorCode: 403,
            message: 'APIの利用制限に達しました。',
            type: "RATE_LIMIT_EXCEEDED"
          }
        })
      })
      
      it('404 エラーはそのまま返却されること', async () => {
        mockGithubClientError(new GitHubApiError(404, 'Not Found'));
        
        await expect(getRepository('owner-x', 'repo-x')).rejects.toThrow('NEXT_HTTP_ERROR_FALLBACK;404');
      })


      it('Github の500 エラーはそのまま返却されること', async () => {
        mockGithubClientError(new GitHubApiError(500, "Internal server error"));
        
        await expect(getRepository('vercel', 'nextjs')).rejects.toThrow("Internal server error");
      })
      
      it('予期せぬエラーはそのまま返却されること', async () => {
        mockGithubClientError(new Error("Unknown test error"));
        consoleHideTestErrorLog(/Unknown test error/);
        
        await expect(getRepository('vercel', 'next.js')).rejects.toThrow("Unknown test error");
      })
    });
  });
})