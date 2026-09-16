import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (msg) => {
  if (msg.type() === "error") errors.push(msg.text());
});

await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
await page.waitForSelector("text=Tally");
await page.screenshot({ path: "/tmp/tally-1-loaded.png" });

// exercise interactions: increment the "Push-ups" card
const pushupsCard = page.locator("li", { hasText: "Push-ups" });
await pushupsCard.getByRole("button", { name: "Click" }).click();
await pushupsCard.getByRole("button", { name: "Click" }).click();
await page.waitForTimeout(300);
await page.screenshot({ path: "/tmp/tally-2-clicked.png" });

// open edit mode
await pushupsCard.getByLabel(/Edit/).click();
await page.waitForTimeout(200);
await page.screenshot({ path: "/tmp/tally-3-edit.png" });
await pushupsCard.getByRole("button", { name: "Cancel" }).click();

// open add tile
await page.getByRole("button", { name: "New tally" }).click();
await page.waitForTimeout(200);
await page.screenshot({ path: "/tmp/tally-4-add.png" });
await page.getByRole("button", { name: "Cancel" }).click();

// theme toggle
await page.getByRole("button", { name: "Toggle color theme" }).click();
await page.waitForTimeout(200);
await page.screenshot({ path: "/tmp/tally-5-dark.png" });

console.log("ERRORS:", JSON.stringify(errors));
await browser.close();
