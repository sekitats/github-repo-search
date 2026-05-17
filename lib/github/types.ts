export type RepositorySummary = {
  id: number;
  name: string;
  owner: {
    login: string;
    avatar_url: string;
  }
}

export type Repositories = {
  total_count: number;
  incomplete_results: boolean;
  items: RepositorySummary[];
}

export type Repository = {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
    avatar_url: string;
  },
  language: string | null;
  stargazers_count: number;
  watchers_count: number;
  forks_count: number;
  open_issues_count: number;
}