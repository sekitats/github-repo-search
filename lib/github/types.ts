export type Success<T> = { data: T; error?: undefined };
export type Failure<E> = { data?: undefined; error: E };
export type Result<T, E = unknown> = Success<T> | Failure<E>

export const ERROR_MESSAGE = {
  RATE_LIMIT_EXCEEDED: "APIの利用制限に達しました。",
  UNPROCESSABLE_ENTITY: "検索条件が不正です",
  NETWORK_ERROR: "通信に失敗しました",
  SERVER_ERROR: "しばらくしてからもう一度お試しください",
} as const

export type GithubApiErrorType = 
  | { type: "RATE_LIMIT_EXCEEDED"; errorCode: number; message: string }
  | { type: "UNPROCESSABLE_ENTITY"; errorCode: number; message: string }