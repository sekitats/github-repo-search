import { vi } from 'vitest';
import { getRepositories, getRepository } from "../service";
import { GitHubApiError } from '../errors';
import * as client from '../client';
import { Repositories, Repository } from '../schema';

vi.mock('next/cache', () => ({
  cacheLife: vi.fn(),
}));

describe('serivce.ts', () => {
  const mockGithubClientSuccess = (data: Repositories | Repository) => {
    vi.spyOn(client, 'githubClient').mockResolvedValue(data);
  }
  const mockGithubClientError = (error: Error) => {
    vi.spyOn(client, 'githubClient').mockRejectedValue(error);
  }
  const consoleHideTestErrorLog = (pattern: RegExp) =>{
    vi.spyOn(console, 'error').mockImplementationOnce((message: string) => {
      if (pattern.test(message)) return;
    });
  }

  beforeEach(() => {
    vi.clearAllMocks();
  })

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

  describe('getRepositories', () => {
    describe('success', () => {
      it('githubClient が正しいパスで呼ばれること', async () => {
        const testData = {
          total_count: 1,
          incomplete_results: false,
          items: [dummyRepo]
        };
        mockGithubClientSuccess(testData);
        
        await getRepositories('next.js');
        
        expect(client.githubClient).toHaveBeenCalledWith('search/repositories?q=next.js&per_page=10&page=1')
      })

      it('unknown_fieldが取り除かれること', async () => {
        const testData = {
          total_count: 1,
          incomplete_results: false,
          items: [dummyRepo]
        };
        mockGithubClientSuccess(testData);
        
        const res = await getRepositories('next.js');
        const data = res.data!;
        
        expect(data.items[0]).not.toHaveProperty('unknown_field');
      })
    })
  
    describe('error', () => {
      it('APIレート制限エラー', async () => {
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
      
      it('検索条件が不正', async () => {
        mockGithubClientError(new GitHubApiError(422, "Validation failed"));
        
        const res = await getRepositories('');
        expect(res).toEqual({
          error: {
            errorCode: 422,
            message: "検索条件が不正です",
            type: "UNPROCESSABLE_ENTITY"
          }
        })
      })
      
      it('予期せぬエラーが返却される', async () => {
        mockGithubClientError(new Error("Unknown test error"));
        consoleHideTestErrorLog(/Unknown test error/);
        
        await expect(getRepositories('nextjs')).rejects.toThrow("Unknown test error");
      });
    });
  });


  describe('getRepository', () => {
    describe('success', () => {
      it('githubClientが正しいパスで呼ばれること', async () => {
        mockGithubClientSuccess(dummyRepo);

        await getRepository('vercel', 'next.js');

        expect(client.githubClient).toHaveBeenCalledWith('repos/vercel/next.js');
      });

      it('unknown_fieldが取り除かれること', async () => {
        mockGithubClientSuccess(dummyRepo);

        const res = await getRepository('vercel', 'next.js');
        const data = res.data;

        expect(data).not.toHaveProperty('unknown_field')
      });
    });

    describe('error', () => {
      it('APIレート制限エラー', async () => {
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
      
      it('404エラー', async () => {
        mockGithubClientError(new GitHubApiError(404, 'Not Found'));
        
        await expect(getRepository('vercel', 'next.js')).rejects.toThrow('NEXT_HTTP_ERROR_FALLBACK;404');
      })
      
      it('予期せぬエラーが返却される', async () => {
        mockGithubClientError(new Error("Unknown test error"));
        consoleHideTestErrorLog(/Unknown test error/);
        
        await expect(getRepository('vercel', 'next.js')).rejects.toThrow("Unknown test error");
      })
    });
  });
})