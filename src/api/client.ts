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

/**
 * Fetch every page of posts and return one flat list.
 *
 * Why: the kratecms API doesn't support detail lookup by slug
 * (https://github.com/jaballer/kratecms/issues/576). The detail page
 * resolves slug → post client-side from this merged list. The list
 * response already includes the full `content` field, so there's no
 * separate detail fetch.
 *
 * Failure mode: page 1 is required — without it we have nothing to
 * resolve against — so it throws. Pages 2+ are best-effort via
 * Promise.allSettled, so a transient failure on page 7 doesn't break
 * the detail page for a post on page 1. A user navigating to a slug
 * on a failed page will see the standard "Post not found" alert.
 *
 * Acceptable while the dataset is small (currently 18 posts / 2 pages).
 * If the catalog grows past ~5 pages, switch to a server-side slug route.
 */
export async function listAllPosts(): Promise<Post[]> {
  const first = await listPosts({ page: 1 });
  const all: Post[] = [...first.data];

  const remaining = first.meta.last_page - 1;
  if (remaining <= 0) return all;

  // Fetch pages 2..last in parallel; tolerate individual failures.
  const pages = Array.from({ length: remaining }, (_, i) => i + 2);
  const results = await Promise.allSettled(
    pages.map((page) => listPosts({ page })),
  );

  for (const [i, result] of results.entries()) {
    if (result.status === "fulfilled") {
      all.push(...result.value.data);
    } else {
      console.warn(
        `[kratecms] failed to fetch posts page ${pages[i]}; skipping. ` +
          `Detail pages for posts on this page will 404 until the next refresh.`,
        result.reason,
      );
    }
  }

  return all;
}
