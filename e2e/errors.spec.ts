import { test, expect } from "@playwright/test";

test.describe("Error states", () => {
  test("a missing post id surfaces a 404 alert with no retry button", async ({ page }) => {
    await page.goto("/posts/99999");

    const alert = page.getByRole("alert");
    await expect(alert).toBeVisible();
    await expect(alert).toContainText(/Post not found/);

    // 404 should not offer a retry — clicking again won't change the answer
    await expect(alert.getByRole("button", { name: /try again/i })).toHaveCount(0);
  });

  test("an unknown route shows the page-not-found error element", async ({ page }) => {
    await page.goto("/this-route-does-not-exist");

    await expect(page.getByRole("alert")).toContainText(/not found/i);
  });
});
