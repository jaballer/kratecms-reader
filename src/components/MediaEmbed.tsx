import type { Post } from "../api/types";

function youtubeIdFromUrl(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) {
      return u.pathname.replace(/^\//, "") || null;
    }
    if (u.searchParams.get("v")) return u.searchParams.get("v");
    const match = u.pathname.match(/\/embed\/([^/?#]+)/);
    if (match) return match[1];
    return null;
  } catch {
    return null;
  }
}

// SoundCloud share URLs (soundcloud.com/...) are blocked from iframes by
// X-Frame-Options. The dedicated player at w.soundcloud.com/player accepts
// a `url=` param pointing at the original share URL.
function soundcloudPlayerUrl(shareUrl: string): string {
  return `https://w.soundcloud.com/player/?url=${encodeURIComponent(shareUrl)}&color=%23aa3bff&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=false`;
}

function isSoundCloud(post: Post): boolean {
  if (post.embed_provider?.toLowerCase() === "soundcloud") return true;
  if (post.embed_url?.includes("soundcloud.com")) return true;
  return false;
}

interface MediaEmbedProps {
  post: Post;
}

export function MediaEmbed({ post }: MediaEmbedProps) {
  if (post.youtube_link) {
    const id = youtubeIdFromUrl(post.youtube_link);
    if (!id) return null;
    return (
      <div className="my-6 aspect-video overflow-hidden rounded-lg border border-border bg-black">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}`}
          title={`YouTube video for ${post.title}`}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="h-full w-full border-0"
        />
      </div>
    );
  }

  if (post.embed_url) {
    if (isSoundCloud(post)) {
      return (
        <div className="my-6 overflow-hidden rounded-lg border border-border">
          <iframe
            src={soundcloudPlayerUrl(post.embed_url)}
            title={`SoundCloud player for ${post.title}`}
            loading="lazy"
            allow="autoplay"
            className="block h-40 w-full border-0"
          />
        </div>
      );
    }

    // Unknown provider — try the embed, but show a fallback link in case the
    // host blocks framing (X-Frame-Options / CSP).
    return (
      <figure className="my-6">
        <div className="overflow-hidden rounded-lg border border-border">
          <iframe
            src={post.embed_url}
            title={`${post.embed_provider ?? "Embedded"} content for ${post.title}`}
            loading="lazy"
            allow="autoplay; clipboard-write; encrypted-media"
            className="block h-40 w-full border-0"
          />
        </div>
        <figcaption className="mt-2 text-xs text-fg">
          Can't see the embed?{" "}
          <a
            href={post.embed_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent underline underline-offset-2"
          >
            Open on {post.embed_provider ?? "the original site"}
          </a>
          .
        </figcaption>
      </figure>
    );
  }

  return null;
}
