import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test("renders the post list and exposes the filter chip group", async ({ page }) => {
    await page.goto("/");

    // Page title from index.html
    await expect(page).toHaveTitle(/Krate Reader/);

    // H1 of the feed
    await expect(
      page.getByRole("heading", { name: "The Krate feed", level: 1 }),
    ).toBeVisible();

    // Posts grid populates from the API
    const articles = page.locator("main article");
    await expect(articles).not.toHaveCount(0);

    // Filter group is exposed with the right role + label
    const filterGroup = page.getByRole("group", {
      name: "Filter by category",
    });
    await expect(filterGroup).toBeVisible();

    // On initial render "All" is the active chip
    await expect(
      filterGroup.getByRole("button", { name: /^All/ }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  test("filtering by audio category narrows the visible posts", async ({ page }) => {
    await page.goto("/");

    const audioChip = page
      .getByRole("group", { name: "Filter by category" })
      .getByRole("button", { name: /^audio/ });
    await audioChip.click();

    // aria-pressed flips on the audio chip
    await expect(audioChip).toHaveAttribute("aria-pressed", "true");

    // Every visible card carries the audio badge
    const badges = page.locator("main article >> text=audio");
    await expect(badges.first()).toBeVisible();

    // The live total indicator shows the server-filtered count
    // (e.g. "4 audio posts"). Phrasing covers both "1 audio post" and
    // "N audio posts" via the optional `s`.
    await expect(page.getByText(/\d+ audio posts?/)).toBeVisible();
  });

  test("category filter is applied server-side (request carries ?category=)", async ({ page }) => {
    const filteredRequests: string[] = [];
    page.on("request", (req) => {
      const url = req.url();
      if (url.includes("/api/v1/posts") && url.includes("category=")) {
        filteredRequests.push(url);
      }
    });

    await page.goto("/");
    await page
      .getByRole("group", { name: "Filter by category" })
      .getByRole("button", { name: /^audio/ })
      .click();

    // Wait for the filtered request to land
    await page.waitForResponse(
      (r) => r.url().includes("category=audio") && r.status() === 200,
    );

    // At least one request carried the category param (initial render is
    // unfiltered, so 1+ filtered requests after the click).
    expect(filteredRequests.some((u) => /category=audio/.test(u))).toBe(true);
  });

  test("pagination has aria-current and a disabled prev on page 1", async ({ page }) => {
    await page.goto("/");

    const pagination = page.getByRole("navigation", { name: "Pagination" });
    await expect(pagination).toBeVisible();

    // Page 1 is the current page
    await expect(pagination.getByRole("button", { name: "Page 1" })).toHaveAttribute(
      "aria-current",
      "page",
    );

    // Previous is disabled on the first page
    await expect(
      pagination.getByRole("button", { name: "Previous page" }),
    ).toBeDisabled();

    // Click page 2 → aria-current moves
    await pagination.getByRole("button", { name: "Page 2" }).click();
    await expect(pagination.getByRole("button", { name: "Page 2" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    await expect(
      pagination.getByRole("button", { name: "Next page" }),
    ).toBeDisabled();
  });
});
