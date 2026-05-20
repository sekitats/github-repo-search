export type ApiError =
  | { kind: "api"; message: string }
  | { kind: "schema"; message: string }
  | { kind: "unknown"; message: string }

export type Result<T, E = ApiError> =
  | { ok: true; data: T }
  | { ok: false; error: E };