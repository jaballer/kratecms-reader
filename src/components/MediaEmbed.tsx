import type { Post, PostCategory } from "../api/types";

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

/**
 * Decide what (if anything) to render below an audio file. An audio-category
 * post often has BOTH a native MP3 *and* a YouTube/SoundCloud reference for
 * the same track. Showing both is redundant — prefer the native audio and
 * suppress the secondary embed. For non-audio posts the YouTube/embed_url
 * is the primary content and should still render.
 */
function shouldRenderSecondaryEmbed(post: Post, hasAudio: boolean): boolean {
  if (!hasAudio) return true;
  return (post.category as PostCategory) !== "audio";
}

function AudioPlayer({ post }: { post: Post }) {
  if (!post.audio_url) return null;

  // audio_filename is a human-friendly label set in the kratecms admin —
  // sometimes a real filename ("Memories.mp3"), sometimes just a display
  // name ("Fake It Till I Make It"). Use whatever the author set; fall
  // back to the post title.
  const label = post.audio_filename?.trim() || post.title;

  return (
    <figure className="my-6">
      <audio
        controls
        preload="metadata"
        src={post.audio_url}
        aria-label={`Audio: ${label}`}
        className="w-full"
      >
        {/* Fallback for browsers that don't support <audio>. */}
        Your browser doesn't support embedded audio.{" "}
        <a
          href={post.audio_url}
          className="text-accent underline underline-offset-2"
        >
          Download {label}
        </a>
        .
      </audio>
      {post.audio_filename ? (
        <figcaption className="mt-2 text-xs text-fg">
          ♪ {post.audio_filename}
        </figcaption>
      ) : null}
    </figure>
  );
}

function YouTubeEmbed({ post }: { post: Post }) {
  if (!post.youtube_link) return null;
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

function ProviderEmbed({ post }: { post: Post }) {
  if (!post.embed_url) return null;

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

  // Unknown provider — try the iframe, plus a fallback link in case the host
  // blocks framing (X-Frame-Options / CSP).
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

export function MediaEmbed({ post }: MediaEmbedProps) {
  const hasAudio = !!post.audio_url;
  const showSecondary = shouldRenderSecondaryEmbed(post, hasAudio);

  return (
    <>
      <AudioPlayer post={post} />
      {showSecondary && post.youtube_link ? <YouTubeEmbed post={post} /> : null}
      {showSecondary && post.embed_url && !post.youtube_link ? (
        <ProviderEmbed post={post} />
      ) : null}
    </>
  );
}
