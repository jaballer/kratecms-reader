import { useEffect, useMemo, useRef } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { allPostsQuery } from "../api/queries";
import { Spinner } from "../components/Spinner";
import { ErrorState } from "../components/ErrorState";
import { CategoryBadge } from "../components/CategoryBadge";
import { MediaEmbed } from "../components/MediaEmbed";
import { formatDate, formatDateTimeAttr } from "../lib/format";
import type { Post } from "../api/types";

interface SlugLookup {
  post: Post | null;
  /** True when the URL param was a numeric id — we should redirect to the slug URL. */
  needsCanonicalRedirect: boolean;
}

function findPost(posts: Post[], param: string): SlugLookup {
  // Slug match wins (the canonical URL form)
  const bySlug = posts.find((p) => p.slug === param);
  if (bySlug) return { post: bySlug, needsCanonicalRedirect: false };

  // Numeric param → legacy /posts/:id URL. Redirect to slug for SEO + bookmarks.
  const numericId = Number(param);
  if (Number.isFinite(numericId)) {
    const byId = posts.find((p) => p.id === numericId);
    if (byId) return { post: byId, needsCanonicalRedirect: true };
  }

  return { post: null, needsCanonicalRedirect: false };
}

export function PostDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const titleRef = useRef<HTMLHeadingElement>(null);

  const { data, isLoading, isError, error, refetch } = useQuery({
    ...allPostsQuery(),
    enabled: !!slug,
  });

  const lookup = useMemo<SlugLookup>(
    () =>
      data && slug
        ? findPost(data, slug)
        : { post: null, needsCanonicalRedirect: false },
    [data, slug],
  );

  // Move focus to the title on route change for screen-reader users.
  useEffect(() => {
    if (lookup.post && titleRef.current) titleRef.current.focus();
  }, [lookup.post]);

  if (isLoading) return <Spinner label="Loading post" />;

  if (isError) {
    return (
      <ErrorState
        title="Could not load post"
        message={
          error instanceof Error ? error.message : "Unknown error from the API."
        }
        onRetry={() => refetch()}
      />
    );
  }

  // Redirect legacy /posts/:id to canonical /posts/:slug. `replace` so the
  // legacy URL doesn't end up in browser history.
  if (lookup.post && lookup.needsCanonicalRedirect) {
    return <Navigate to={`/posts/${lookup.post.slug}`} replace />;
  }

  if (!lookup.post) {
    return (
      <ErrorState
        title="Post not found"
        message={`No post matches "${slug ?? ""}".`}
      />
    );
  }

  const post = lookup.post;

  return (
    <article aria-labelledby="post-title">
      <Link
        to="/"
        className="inline-flex items-center gap-1 text-sm text-fg no-underline hover:text-fg-strong"
      >
        ← All posts
      </Link>

      <header className="mt-4 mb-6">
        <div className="mb-3 flex items-center gap-3 text-sm text-fg">
          <CategoryBadge category={post.category} />
          <time dateTime={formatDateTimeAttr(post.published_at)}>
            {formatDate(post.published_at)}
          </time>
          <span aria-hidden="true">·</span>
          <span>
            By <span className="text-fg-strong">{post.author.name}</span>
          </span>
        </div>

        <h1
          id="post-title"
          ref={titleRef}
          tabIndex={-1}
          className="font-heading text-3xl leading-tight tracking-tight text-fg-strong outline-none sm:text-4xl"
        >
          {post.title}
        </h1>

        {post.excerpt ? (
          <p className="mt-4 text-lg text-fg">{post.excerpt}</p>
        ) : null}
      </header>

      {post.featured_image ? (
        <img
          src={post.featured_image}
          alt={post.featured_image_alt ?? ""}
          className="mb-8 aspect-video w-full rounded-lg border border-border object-cover"
          loading="eager"
          decoding="async"
        />
      ) : null}

      <MediaEmbed post={post} />

      <div
        className="prose-krate max-w-3xl text-fg"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
    </article>
  );
}
