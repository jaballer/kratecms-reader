import { test, expect } from "@playwright/test";

test.describe("Post detail navigation", () => {
  test("clicking a post navigates to /posts/:id and moves focus to the H1", async ({ page }) => {
    await page.goto("/");

    // Grab the first post's title link
    const firstCard = page.locator("main article").first();
    const firstLink = firstCard.getByRole("link").first();
    const expectedTitle = (await firstLink.textContent())?.trim() ?? "";

    await firstLink.click();

    // URL changes to /posts/:id
    await expect(page).toHaveURL(/\/posts\/\d+$/);

    // The detail page's H1 matches the title we clicked
    const h1 = page.getByRole("heading", { level: 1 });
    await expect(h1).toHaveText(expectedTitle);

    // The H1 receives focus on route change — the core a11y signal
    await expect(h1).toBeFocused();

    // The H1 must be programmatically focusable (tabindex=-1)
    await expect(h1).toHaveAttribute("tabindex", "-1");
  });

  test("back link returns to the list", async ({ page }) => {
    await page.goto("/posts/34");

    await page.getByRole("link", { name: /All posts/i }).click();

    await expect(page).toHaveURL("/");
    await expect(
      page.getByRole("heading", { name: "The Krate feed", level: 1 }),
    ).toBeVisible();
  });

  test("multimedia posts render an iframe with a title attribute", async ({ page }) => {
    // Post 34 is the "KrateCMS: why we built..." post with a YouTube embed
    await page.goto("/posts/34");

    const iframe = page.locator("iframe").first();
    await expect(iframe).toBeVisible();
    // a11y: iframes must have a title that describes the embed
    await expect(iframe).toHaveAttribute("title", /YouTube video/);
  });
});
