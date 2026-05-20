export type PostCategory = "text" | "audio" | "video" | string;

export type PostStatus = "published" | "draft" | string;

export interface Author {
  id: number;
  name: string;
  email: string;
}

export interface Post {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  category: PostCategory;
  featured_image: string | null;
  featured_image_alt: string | null;
  youtube_link: string | null;
  embed_url: string | null;
  embed_provider: string | null;
  /**
   * Native audio file URL — currently NOT exposed by the kratecms API but
   * tracked at https://github.com/jaballer/kratecms/issues/581. Once the
   * field lands, MediaEmbed will render an <audio> player for any category
   * (typically `audio`) post that ships one. Optional so the type is
   * forward-compatible.
   */
  audio_url?: string | null;
  audio_mime_type?: string | null;
  status: PostStatus;
  published_at: string;
  created_at: string;
  updated_at: string;
  author: Author;
  links: { self: string };
}

// The Krate API currently returns these meta values as `[value, value]` arrays
// instead of scalars. We accept both shapes — see normalizeMeta() in client.ts.
type MaybeBoxed<T> = T | [T, T];

export interface RawPaginationMeta {
  current_page: MaybeBoxed<number>;
  last_page: MaybeBoxed<number>;
  per_page: MaybeBoxed<number>;
  total: MaybeBoxed<number>;
  from: number | null;
  to: number | null;
  path: string;
}

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
  path: string;
}

export interface PaginationLinks {
  self: string;
  first: string | null;
  last: string | null;
  prev: string | null;
  next: string | null;
}

export interface RawPaginatedResponse<T> {
  data: T[];
  meta: RawPaginationMeta;
  links: PaginationLinks;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
  links: PaginationLinks;
}

export interface SingleResponse<T> {
  data: T;
}
