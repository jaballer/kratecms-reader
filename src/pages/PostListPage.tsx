import { useMemo, useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { postsQuery } from "../api/queries";
import { PostCard } from "../components/PostCard";
import { Spinner } from "../components/Spinner";
import { ErrorState } from "../components/ErrorState";
import { CategoryFilter } from "../components/CategoryFilter";
import { Pagination } from "../components/Pagination";

export function PostListPage() {
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState<string | null>(null);

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    ...postsQuery({ page }),
    placeholderData: keepPreviousData,
  });

  const visiblePosts = useMemo(() => {
    if (!data) return [];
    if (!category) return data.data;
    return data.data.filter((p) => p.category === category);
  }, [data, category]);

  const { categories, counts } = useMemo(() => {
    const set = new Set<string>();
    const counter: Record<string, number> = {};
    for (const p of data?.data ?? []) {
      set.add(p.category);
      counter[p.category] = (counter[p.category] ?? 0) + 1;
    }
    return { categories: [...set].sort(), counts: counter };
  }, [data]);

  return (
    <section aria-labelledby="page-title">
      <header className="mb-8">
        <h1
          id="page-title"
          className="font-heading text-4xl tracking-tight text-fg-strong sm:text-5xl"
        >
          The Krate feed
        </h1>
        <p className="mt-2 max-w-2xl text-fg">
          Posts pulled live from the KrateCMS API. Text, audio, and video — all
          rendered with the same React 19 + Tailwind setup.
        </p>
      </header>

      {isLoading ? (
        <Spinner label="Loading posts" />
      ) : isError ? (
        <ErrorState
          message={
            error instanceof Error
              ? error.message
              : "Could not load posts from the Krate API."
          }
          onRetry={() => refetch()}
        />
      ) : data ? (
        <>
          <div className="mb-6 flex items-center justify-between gap-4">
            <CategoryFilter
              categories={categories}
              active={category}
              onChange={setCategory}
              counts={counts}
              total={data.data.length}
            />
            <div
              aria-live="polite"
              className="text-xs tabular-nums text-fg"
            >
              {isFetching ? "Refreshing…" : `${visiblePosts.length} shown`}
            </div>
          </div>

          {visiblePosts.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border p-8 text-center text-fg">
              No posts in this category.
            </p>
          ) : (
            <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {visiblePosts.map((post) => (
                <li key={post.id} className="contents">
                  <PostCard post={post} />
                </li>
              ))}
            </ul>
          )}

          <Pagination
            currentPage={data.meta.current_page}
            lastPage={data.meta.last_page}
            onChange={(next) => {
              setPage(next);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        </>
      ) : null}
    </section>
  );
}
