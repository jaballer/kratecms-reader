import { queryOptions } from "@tanstack/react-query";
import {
  getPostById,
  listAllPosts,
  listPosts,
  type ListPostsParams,
} from "./client";

export const postsQuery = (params: ListPostsParams = {}) =>
  queryOptions({
    queryKey: ["posts", "list", params],
    queryFn: () => listPosts(params),
    staleTime: 60_000,
  });

/**
 * Merged all-pages list — used by the detail page to resolve a slug to a
 * post. Separate from `postsQuery` so the list page only pays for one page.
 */
export const allPostsQuery = () =>
  queryOptions({
    queryKey: ["posts", "all"],
    queryFn: () => listAllPosts(),
    staleTime: 60_000,
  });

export const postQuery = (id: number | string) =>
  queryOptions({
    queryKey: ["posts", "detail", String(id)],
    queryFn: () => getPostById(id),
    staleTime: 60_000,
  });
