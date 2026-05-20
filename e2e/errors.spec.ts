import { test, expect } from "@playwright/test";

test.describe("Error states", () => {
  test("an unknown slug surfaces a 404 alert with no retry button", async ({ page }) => {
    await page.goto("/posts/this-slug-does-not-exist-xyz");

    const alert = page.getByRole("alert");
    await expect(alert).toBeVisible();
    await expect(alert).toContainText(/Post not found/);

    // 404 should not offer a retry — clicking again won't change the answer
    await expect(alert.getByRole("button", { name: /try again/i })).toHaveCount(0);
  });

  test("a non-existent numeric id surfaces a 404 alert (no redirect)", async ({ page }) => {
    await page.goto("/posts/99999");

    // The all-posts cache resolves; lookup finds no match by slug OR id; 404 shown.
    const alert = page.getByRole("alert");
    await expect(alert).toBeVisible();
    await expect(alert).toContainText(/Post not found/);
    // URL stays as-is (no redirect could be computed)
    await expect(page).toHaveURL(/\/posts\/99999$/);
  });

  // Regression: Number("0x22") === 34, Number("1e2") === 100. If the
  // legacy-id branch used Number() without a strict-decimal guard, these
  // crafted URLs would silently redirect to real posts (id 34 and 100).
  // Each case below should land on the 404 alert. Flagged by Codex in PR #1.
  // We only assert on the alert, not the URL — a redirect would never
  // produce an alert, and URL-encoding makes pattern matching brittle.
  for (const tricky of ["0x22", "1e2", "0x1f", "+34", "34.0"]) {
    test(`crafted non-decimal "${tricky}" does NOT redirect to a real post`, async ({ page }) => {
      await page.goto(`/posts/${encodeURIComponent(tricky)}`);
      const alert = page.getByRole("alert");
      await expect(alert).toBeVisible();
      await expect(alert).toContainText(/Post not found/);
    });
  }

  test("an unknown route shows the page-not-found error element", async ({ page }) => {
    await page.goto("/this-route-does-not-exist");

    await expect(page.getByRole("alert")).toContainText(/not found/i);
  });
});
