import { useEffect, useRef } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { postQuery } from "../api/queries";
import { Spinner } from "../components/Spinner";
import { ErrorState } from "../components/ErrorState";
import { CategoryBadge } from "../components/CategoryBadge";
import { MediaEmbed } from "../components/MediaEmbed";
import { ApiError } from "../api/client";
import { formatDate, formatDateTimeAttr } from "../lib/format";

export function PostDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const titleRef = useRef<HTMLHeadingElement>(null);

  const { data, isLoading, isError, error, refetch } = useQuery({
    ...postQuery(slug ?? ""),
    enabled: !!slug,
  });

  // Move focus to the title on route change for screen-reader users.
  useEffect(() => {
    if (data && titleRef.current) titleRef.current.focus();
  }, [data]);

  if (isLoading) return <Spinner label="Loading post" />;

  if (isError) {
    const status = error instanceof ApiError ? error.status : undefined;
    return (
      <ErrorState
        title={status === 404 ? "Post not found" : "Could not load post"}
        message={
          error instanceof Error ? error.message : "Unknown error from the API."
        }
        // 404s won't be fixed by retrying; suppress the button to keep the UI honest.
        onRetry={status === 404 ? undefined : () => refetch()}
      />
    );
  }

  if (!data) return null;

  // Canonicalize the URL. The polymorphic API accepts either id or slug; the
  // canonical URL form is the slug. If the user arrived via a legacy
  // /posts/:id (or any non-slug input the server resolved), redirect them so
  // bookmarks, social shares, and SEO all point at the same place. `replace`
  // means the legacy URL doesn't end up in browser history.
  if (slug && slug !== data.slug) {
    return <Navigate to={`/posts/${data.slug}`} replace />;
  }

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
          <CategoryBadge category={data.category} />
          <time dateTime={formatDateTimeAttr(data.published_at)}>
            {formatDate(data.published_at)}
          </time>
          <span aria-hidden="true">·</span>
          <span>
            By <span className="text-fg-strong">{data.author.name}</span>
          </span>
        </div>

        <h1
          id="post-title"
          ref={titleRef}
          tabIndex={-1}
          className="font-heading text-3xl leading-tight tracking-tight text-fg-strong outline-none sm:text-4xl"
        >
          {data.title}
        </h1>

        {data.excerpt ? (
          <p className="mt-4 text-lg text-fg">{data.excerpt}</p>
        ) : null}
      </header>

      {data.featured_image ? (
        <img
          src={data.featured_image}
          alt={data.featured_image_alt ?? ""}
          className="mb-8 aspect-video w-full rounded-lg border border-border object-cover"
          loading="eager"
          decoding="async"
        />
      ) : null}

      <MediaEmbed post={data} />

      <div
        className="prose-krate max-w-3xl text-fg"
        dangerouslySetInnerHTML={{ __html: data.content }}
      />
    </article>
  );
}
