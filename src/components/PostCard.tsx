import { Link } from "react-router-dom";
import type { Post } from "../api/types";
import { CategoryBadge } from "./CategoryBadge";
import { formatDate, formatDateTimeAttr } from "../lib/format";

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  return (
    <article className="group relative flex flex-col gap-3 rounded-lg border border-border bg-bg p-5 transition-shadow hover:shadow-lg focus-within:shadow-lg">
      {post.featured_image ? (
        <div className="-m-5 mb-0 aspect-video overflow-hidden rounded-t-lg bg-code-bg">
          <img
            src={post.featured_image}
            alt={post.featured_image_alt ?? ""}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-300 motion-reduce:transition-none group-hover:scale-[1.02]"
          />
        </div>
      ) : null}

      <div className="flex items-center gap-3 text-xs text-fg">
        <CategoryBadge category={post.category} />
        <time dateTime={formatDateTimeAttr(post.published_at)}>
          {formatDate(post.published_at)}
        </time>
      </div>

      <h2 className="font-heading text-xl leading-snug text-fg-strong">
        <Link
          to={`/posts/${post.slug}`}
          className="no-underline before:absolute before:inset-0"
        >
          {post.title}
        </Link>
      </h2>

      {post.excerpt ? (
        <p className="line-clamp-3 text-sm">{post.excerpt}</p>
      ) : null}

      <div className="mt-auto text-xs text-fg">
        By <span className="text-fg-strong">{post.author.name}</span>
      </div>
    </article>
  );
}
