import { test, expect } from "@playwright/test";

test.describe("リポジトリ検索 E2Eテスト", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000/");
  });

  test("検索して10件（デフォルト）のリストが表示されること", async ({
    page,
  }) => {
    const input = page.getByPlaceholder("リポジトリを検索");
    await input.pressSequentially("react", { delay: 50 });
    await page.getByRole("button", { name: "検索" }).click();

    await expect(page.locator('a[href^="/repos/"]')).toHaveCount(10);
  });

  test("存在しないクエリの場合は「リポジトリがありません。」が表示されること", async ({
    page,
  }) => {
    const input = page.getByPlaceholder("リポジトリを検索");
    // 絶対に存在しないであろうランダムな文字列
    await input.pressSequentially(
      "thisisafakerepositorynamethatdoesnotexist123456789",
      { delay: 50 },
    );
    await page.getByRole("button", { name: "検索" }).click();

    await expect(page.getByText("リポジトリがありません。")).toBeVisible();
  });

  test("検索結果をクリックすると詳細ページに遷移すること", async ({ page }) => {
    const input = page.getByPlaceholder("リポジトリを検索");
    await input.pressSequentially("react", { delay: 50 });
    await page.getByRole("button", { name: "検索" }).click();

    const firstRepo = page.locator('a[href^="/repos/"]').first();
    const repoName = await firstRepo.textContent();

    await firstRepo.click();

    // URLが詳細ページの形式になっていること
    await expect(page).toHaveURL(/\/repos\/.+\/.+/);

    // 詳細ページに見出しとしてリポジトリ名が表示されていること
    if (repoName) {
      await expect(
        page
          .getByRole("heading", { name: repoName.trim(), exact: false })
          .first(),
      ).toBeVisible();
    }
  });

  test("ページネーション：次へ・前への遷移ができること", async ({ page }) => {
    const input = page.getByPlaceholder("リポジトリを検索");
    await input.pressSequentially("react", { delay: 50 });
    await page.getByRole("button", { name: "検索" }).click();

    await expect(page.locator('a[href^="/repos/"]')).toHaveCount(10);

    const nextButton = page.getByRole("link", { name: "Go to next page" });
    await nextButton.click();

    // URLに page=2 が付いていること
    await expect(page).toHaveURL(/page=2/);

    await expect(page.locator('a[href^="/repos/"]')).toHaveCount(10);

    const prevButton = page.getByRole("link", { name: "Go to previous page" });
    await prevButton.click();

    // URLが元のクエリに戻ること（page=2が消えていること）
    await expect(page).not.toHaveURL(/page=2/);
  });

  test("ブラウザバック：戻るボタンでURLと状態が復元されること", async ({
    page,
  }) => {
    const input = page.getByPlaceholder("リポジトリを検索");

    await input.pressSequentially("react", { delay: 50 });
    await page.getByRole("button", { name: "検索" }).click();
    await expect(page).toHaveURL(/\?q=react/);
    await expect(page.locator('a[href^="/repos/"]')).toHaveCount(10);

    const clearButton = page.getByRole("button", { name: "クリア" });
    await clearButton.click();

    // クリアボタンクリックで一度、'/' へ遷移する
    await expect(page).toHaveURL(/\//);

    await input.pressSequentially("vue", { delay: 50 });
    await page.getByRole("button", { name: "検索" }).click();
    await expect(page).toHaveURL(/\?q=vue/);
    await expect(page.locator('a[href^="/repos/"]')).toHaveCount(10);

    await page.goBack();
    // もう一度ブラウザバックで '?q=react' 状態のページに戻る
    await page.goBack();

    await page.waitForLoadState("networkidle");

    await expect(page).toHaveURL(/\?q=react/);
    // 実際にはvueの入力値が入っている
    await expect(input).toHaveValue("vue");
  });
});
