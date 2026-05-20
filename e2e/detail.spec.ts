import { test, expect } from "@playwright/test";

// Canonical slug URLs we test against. Both posts exist in the kratecms
// seed data — used to verify routing without depending on the order the
// API returns posts in.
const KRATECMS_POST_SLUG =
  "kratecms-why-we-built-a-laravel-first-cms-and-whats-next";
const KRATECMS_POST_ID = 34;
const HIKING_BARS_SLUG = "hiking-bars";

test.describe("Post detail navigation", () => {
  test("clicking a post navigates to /posts/:slug and moves focus to the H1", async ({ page }) => {
    await page.goto("/");

    // Grab the first post's title link
    const firstCard = page.locator("main article").first();
    const firstLink = firstCard.getByRole("link").first();
    const expectedTitle = (await firstLink.textContent())?.trim() ?? "";

    await firstLink.click();

    // URL is now slug-based — at least one non-digit character, no trailing slash
    await expect(page).toHaveURL(/\/posts\/[a-z0-9-]+$/);
    // Specifically NOT a numeric id
    await expect(page).not.toHaveURL(/\/posts\/\d+$/);

    // The detail page's H1 matches the title we clicked
    const h1 = page.getByRole("heading", { level: 1 });
    await expect(h1).toHaveText(expectedTitle);

    // The H1 receives focus on route change — the core a11y signal
    await expect(h1).toBeFocused();

    // The H1 must be programmatically focusable (tabindex=-1)
    await expect(h1).toHaveAttribute("tabindex", "-1");
  });

  test("legacy /posts/:id redirects to canonical /posts/:slug", async ({ page }) => {
    await page.goto(`/posts/${KRATECMS_POST_ID}`);

    // After the all-posts query resolves, <Navigate replace> swaps the URL.
    await expect(page).toHaveURL(`/posts/${KRATECMS_POST_SLUG}`);

    // The detail content still renders — redirect didn't break anything
    await expect(
      page.getByRole("heading", { level: 1 }),
    ).toContainText(/KrateCMS/);
  });

  test("back link returns to the list", async ({ page }) => {
    await page.goto(`/posts/${KRATECMS_POST_SLUG}`);

    await page.getByRole("link", { name: /All posts/i }).click();

    await expect(page).toHaveURL("/");
    await expect(
      page.getByRole("heading", { name: "The Krate feed", level: 1 }),
    ).toBeVisible();
  });

  test("multimedia posts render an iframe with a title attribute", async ({ page }) => {
    // KrateCMS post has a YouTube embed
    await page.goto(`/posts/${KRATECMS_POST_SLUG}`);

    const iframe = page.locator("iframe").first();
    await expect(iframe).toBeVisible();
    // a11y: iframes must have a title that describes the embed
    await expect(iframe).toHaveAttribute("title", /YouTube video/);
  });

  test("detail page issues a single API call (polymorphic slug route)", async ({ page }) => {
    // After adopting kratecms#584, the detail page fetches /posts/:slug
    // directly instead of merging every list page. One API request per
    // detail view, not last_page+1 of them.
    const apiCalls: string[] = [];
    page.on("request", (req) => {
      const url = req.url();
      if (url.includes("/api/v1/posts")) apiCalls.push(url);
    });

    await page.goto(`/posts/${KRATECMS_POST_SLUG}`);
    await expect(
      page.getByRole("heading", { level: 1 }),
    ).toContainText(/KrateCMS/);

    // Exactly one /api/v1/posts request, and it ends in the slug.
    expect(apiCalls).toHaveLength(1);
    expect(apiCalls[0]).toMatch(
      new RegExp(`/api/v1/posts/${KRATECMS_POST_SLUG}$`),
    );
  });

  test("an audio post with a native audio_url renders the <audio> player", async ({ page }) => {
    // /posts/memories ships audio_url + audio_filename after kratecms#589.
    // This is the user-visible parity fix from kratecms-reader#4.
    await page.goto("/posts/memories");

    await expect(
      page.getByRole("heading", { level: 1 }),
    ).toContainText(/Memories/);

    const audio = page.locator("audio").first();
    await expect(audio).toBeVisible();
    await expect(audio).toHaveAttribute("controls", "");
    // src points at the absolute MP3 URL from the API
    await expect(audio).toHaveAttribute("src", /\.mp3(\?.*)?$/);
    // aria-label uses audio_filename when present
    await expect(audio).toHaveAttribute("aria-label", /Audio:.*Memories/);
  });

  test("an audio-category post WITHOUT a native audio_url falls back to the embed (SoundCloud)", async ({ page }) => {
    // hiking-bars has category=audio but audio_url=null — the actual audio
    // lives on SoundCloud via embed_url. Confirms we don't gate the audio
    // render on category, and the secondary embed still appears when no
    // native file is present.
    await page.goto(`/posts/${HIKING_BARS_SLUG}`);

    await expect(
      page.getByRole("heading", { level: 1 }),
    ).toContainText(/Hiking Bars/);

    // No <audio> element (no audio_url to render from)
    await expect(page.locator("audio")).toHaveCount(0);
    // SoundCloud iframe is the embed surface
    const iframe = page.locator("iframe").first();
    await expect(iframe).toBeVisible();
    await expect(iframe).toHaveAttribute("title", /SoundCloud/);
  });
});
