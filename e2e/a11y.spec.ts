import { test, expect } from "@playwright/test";

test.describe("Accessibility baselines", () => {
  test("first Tab reveals the skip link", async ({ page }) => {
    await page.goto("/");

    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: /Skip to main content/i });
    await expect(skip).toBeFocused();
  });

  test("skip link jumps focus to the main landmark", async ({ page }) => {
    await page.goto("/");

    await page.keyboard.press("Tab");           // skip link
    await page.keyboard.press("Enter");         // activate

    // URL hash updates and #main becomes the focus target
    await expect(page).toHaveURL(/#main$/);
  });

  test("landmark structure: exactly one main, one nav, one h1", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator("main")).toHaveCount(1);
    await expect(page.locator("h1")).toHaveCount(1);
    // Header nav + pagination nav = 2 navigation landmarks
    await expect(page.getByRole("navigation")).toHaveCount(2);
  });

  test("no console errors on a typical browse session", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    page.on("pageerror", (err) => errors.push(err.message));

    await page.goto("/");
    await page.locator("main article").first().getByRole("link").first().click();
    await page.waitForURL(/\/posts\/\d+/);
    await page.getByRole("link", { name: /All posts/i }).click();
    await page.waitForURL("/");

    // Filter out third-party noise (e.g. iframe console messages from SoundCloud/YouTube)
    const ownErrors = errors.filter(
      (e) =>
        !/soundcloud\.com|youtube\.com|youtu\.be|X-Frame-Options/i.test(e),
    );
    expect(ownErrors, ownErrors.join("\n")).toHaveLength(0);
  });
});
