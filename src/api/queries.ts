import { queryOptions } from "@tanstack/react-query";
import { getPostById, listPosts, type ListPostsParams } from "./client";

export const postsQuery = (params: ListPostsParams = {}) =>
  queryOptions({
    queryKey: ["posts", params],
    queryFn: () => listPosts(params),
    staleTime: 60_000,
  });

export const postQuery = (id: number | string) =>
  queryOptions({
    queryKey: ["post", String(id)],
    queryFn: () => getPostById(id),
    staleTime: 60_000,
  });
