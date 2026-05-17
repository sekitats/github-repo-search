import { z } from 'zod';

export const repositorySchema = z.object({
  id: z.number(),
  name: z.string(),
  full_name: z.string(),
  owner: z.object({
    login: z.string(),
    avatar_url: z.string(),
  }),
  language: z.string().nullable(),
  stargazers_count: z.number(),
  watchers_count: z.number(),
  forks_count: z.number(),
  open_issues_count: z.number(),
});