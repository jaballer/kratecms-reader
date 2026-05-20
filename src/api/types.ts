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
  /**
   * Absolute URL to a native audio file (e.g. an MP3). Shipped by kratecms
   * in https://github.com/jaballer/kratecms/pull/589 (closes kratecms#581).
   * Null for posts without an attached audio file — including some
   * `category: "audio"` posts that use an `embed_url` (e.g. SoundCloud)
   * instead, and conversely present on some non-audio posts that happen
   * to have a companion audio file. Always check this field directly;
   * don't gate on `category`.
   */
  audio_url: string | null;
  /**
   * Human-friendly label for the audio file. The kratecms admin lets
   * authors set this freely — values in production range from
   * `"Memories.mp3"` (actual filename) to `"Fake It Till I Make It"`
   * (no extension). Treat as a display label / aria-label, NOT as a
   * reliable file extension or download filename.
   */
  audio_filename: string | null;
  embed_url: string | null;
  embed_provider: string | null;
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
