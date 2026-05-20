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

  test("an audio-category post with no native audio_url still renders the YouTube fallback", async ({ page }) => {
    // hiking-bars is an audio post — SoundCloud share URL embed
    await page.goto(`/posts/${HIKING_BARS_SLUG}`);

    await expect(page.getByRole("heading", { level: 1 })).toContainText(/Hiking Bars/);

    // Either SoundCloud or audio element will be present once kratecms#581 lands.
    // For now, the SoundCloud iframe is the embed surface.
    const iframe = page.locator("iframe").first();
    await expect(iframe).toBeVisible();
    await expect(iframe).toHaveAttribute("title", /SoundCloud|YouTube/);
  });
});
