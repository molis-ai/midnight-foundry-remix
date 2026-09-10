import { test, expect } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const output =
  process.env.HUMAN_BUREAU_ARTIFACT_DIR ||
  path.join(process.cwd(), "work", "acceptance");
const next = async (page) =>
  page.getByRole("button", { name: /下一项/ }).click();

test("六题完整旅程、PNG 导出、同题邀请和重玩", async ({
  page,
  context,
}, testInfo) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/#s=381247");
  await expect(
    page.getByRole("heading", { name: /请证明.*你不是/ }),
  ).toBeVisible();
  await mkdir(output, { recursive: true });
  await page.screenshot({
    path: `${output}/人类验证局-${testInfo.project.name}-首页.png`,
    fullPage: true,
  });
  await page.getByRole("button", { name: /开始验证/ }).click();
  for (let i = 0; i < 3; i++)
    await page.getByRole("button", { name: /我不是机器人/ }).click();
  await expect(page.getByText("会追一个框三次的，大概率是人。")).toBeVisible();
  await next(page);
  await page.getByRole("button", { name: "买来就算读过的书" }).click();
  await page.getByRole("button", { name: "第 8 个起床闹钟" }).click();
  await expect(
    page.getByRole("button", { name: "买来就算读过的书" }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "明天一定", exact: true }).click();
  await next(page);
  await page.getByRole("slider").fill("0");
  await page.getByRole("button", { name: "就这样，舒服了" }).click();
  await next(page);
  await page.getByRole("button", { name: "我准备好了" }).click();
  for (let i = 0; i < 4; i++)
    await page.getByRole("button", { name: /千万/ }).click();
  await expect(page.getByText("「不要按」的意思是：你按了 4 次。")).toBeVisible(
    { timeout: 8000 },
  );
  await next(page);
  const hold = page.getByRole("button", { name: "按住开始，松手结束" });
  await hold.focus();
  await page.keyboard.down("Space");
  await expect(
    page.getByRole("button", { name: "凭感觉，松手就好" }),
  ).toBeVisible();
  await page.waitForTimeout(3000);
  await page.keyboard.up("Space");
  await expect(page.getByText(/你的 3 秒，实际是/)).toBeVisible();
  await next(page);
  await page.getByRole("button", { name: "我同意，做个不完美的人" }).click();
  await expect(
    page.getByRole("heading", { name: "手欠好奇型人类", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("「千万别按」？按了 4 次", { exact: true }),
  ).toBeVisible();
  await page.screenshot({
    path: `${output}/人类验证局-${testInfo.project.name}-结果.png`,
    fullPage: true,
  });
  const pending = page.waitForEvent("download");
  await page.getByRole("button", { name: /保存我的人类证明/ }).click();
  const download = await pending;
  expect(download.suggestedFilename()).toContain("手欠好奇型人类");
  expect(await download.failure()).toBeNull();
  await download.saveAs(`${output}/人类证明-${testInfo.project.name}-示例.png`);
  // 拒绝剪贴板权限，验证可恢复的手动复制路径。
  await page.evaluate(() =>
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: () => Promise.reject(new Error("denied")) },
    }),
  );
  await page.getByRole("button", { name: /复制同题挑战链接/ }).click();
  const input = page.getByRole("textbox");
  await expect(input).toBeVisible();
  const link = await input.inputValue();
  expect(link).toContain("s=381247&p=curious");
  const friend = await context.newPage();
  await friend.goto(link);
  await expect(
    friend.getByText("一位「手欠好奇型人类」向你发来同题挑战"),
  ).toBeVisible();
  await friend.close();
  await page.getByRole("button", { name: /不服，重新验证/ }).click();
  await expect(
    page.getByRole("heading", { name: "先走个流程。" }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test("反骨路径、忍住按钮、键盘操作及取消计时恢复", async ({ page }) => {
  await page.goto("/#s=0&p=rebel");
  await page.getByRole("button", { name: "办理须知" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page.getByRole("button", { name: /开始验证/ }).click();
  await page.getByRole("button", { name: "我是机器人又怎样？" }).click();
  await next(page);
  await page.getByRole("button", { name: "我今天就做" }).click();
  await next(page);
  await page.getByRole("button", { name: "歪着也挺好" }).click();
  await next(page);
  await page.getByRole("button", { name: "我准备好了" }).click();
  await expect(page.getByText("真就一下没按。这份定力，请保留。")).toBeVisible({
    timeout: 8000,
  });
  await next(page);
  await page.getByRole("button", { name: "按住开始，松手结束" }).focus();
  await page.keyboard.down("Space");
  await page.keyboard.press("Tab");
  await page.keyboard.up("Space");
  await expect(page.getByText("刚才中断了，再试一次就好。")).toBeVisible();
  await page.getByRole("button", { name: "我的时间，不接受考核" }).click();
  await next(page);
  await page.getByRole("button", { name: "先活着，细则以后再说" }).click();
  await expect(
    page.getByRole("heading", { name: "反骨散装型人类", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("整整 5 秒，一次都没按", { exact: true }),
  ).toBeVisible();
});

test("窄屏没有横向溢出，减少动态效果偏好生效", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth,
    ),
  ).toBe(true);
  await expect(page.locator(".scan-line")).toHaveCSS("display", "none");
  await page.getByRole("button", { name: /开始验证/ }).click();
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth,
    ),
  ).toBe(true);
});
