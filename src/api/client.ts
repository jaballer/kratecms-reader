import type {
  PaginatedResponse,
  PaginationMeta,
  Post,
  RawPaginatedResponse,
  RawPaginationMeta,
  SingleResponse,
} from "./types";

const API_BASE = "/api/v1";

export class ApiError extends Error {
  readonly status: number;
  readonly url: string;

  constructor(message: string, status: number, url: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.url = url;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    headers: { Accept: "application/json", ...(init?.headers ?? {}) },
    ...init,
  });
  if (!res.ok) {
    throw new ApiError(
      `Request to ${url} failed with ${res.status}`,
      res.status,
      url,
    );
  }
  return res.json() as Promise<T>;
}

// Krate currently returns meta values as `[v, v]` arrays in some places.
// Unbox so the rest of the app sees plain numbers.
function unbox(value: number | [number, number]): number {
  return Array.isArray(value) ? value[0] : value;
}

function normalizeMeta(meta: RawPaginationMeta): PaginationMeta {
  return {
    current_page: unbox(meta.current_page),
    last_page: unbox(meta.last_page),
    per_page: unbox(meta.per_page),
    total: unbox(meta.total),
    from: meta.from,
    to: meta.to,
    path: meta.path,
  };
}

export interface ListPostsParams {
  page?: number;
}

export async function listPosts(
  params: ListPostsParams = {},
): Promise<PaginatedResponse<Post>> {
  const query = new URLSearchParams();
  if (params.page && params.page > 1) query.set("page", String(params.page));
  const qs = query.toString();
  const raw = await request<RawPaginatedResponse<Post>>(
    `/posts${qs ? `?${qs}` : ""}`,
  );
  return { ...raw, meta: normalizeMeta(raw.meta) };
}

export async function getPostById(id: number | string): Promise<Post> {
  const res = await request<SingleResponse<Post>>(`/posts/${id}`);
  return res.data;
}
