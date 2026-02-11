import { test, expect } from "@playwright/test";

test.describe("App smoke", () => {
  test("home or sign-in page loads", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/./);
    const body = page.locator("body");
    await expect(body).toBeVisible();
  });
});
