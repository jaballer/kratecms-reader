import { queryOptions } from "@tanstack/react-query";
import { getPost, listPosts, type ListPostsParams } from "./client";

export const postsQuery = (params: ListPostsParams = {}) =>
  queryOptions({
    queryKey: ["posts", "list", params],
    queryFn: () => listPosts(params),
    staleTime: 60_000,
  });

/**
 * Detail query. Param can be a numeric id OR a slug — the upstream route
 * is polymorphic. The component canonicalizes the URL to the slug form
 * after the response arrives.
 */
export const postQuery = (idOrSlug: string) =>
  queryOptions({
    queryKey: ["posts", "detail", idOrSlug],
    queryFn: () => getPost(idOrSlug),
    staleTime: 60_000,
    // Don't auto-retry 404s — refetching won't make the post exist.
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes("404")) return false;
      return failureCount < 1;
    },
  });
