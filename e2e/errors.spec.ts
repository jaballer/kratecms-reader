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

  test("an unknown route shows the page-not-found error element", async ({ page }) => {
    await page.goto("/this-route-does-not-exist");

    await expect(page.getByRole("alert")).toContainText(/not found/i);
  });
});
