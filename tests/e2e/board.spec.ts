import { expect, test, type Page } from "@playwright/test";
import type { BoardTest } from "../board/main";
// The import above is type-only: tests drive the isolated adapter, never Firebase.
declare global {
  interface Window {
    boardTest: BoardTest;
  }
}
const open = async (page: Page) => {
  await page.goto("http://127.0.0.1:3101");
  await expect(
    page.getByText("Table synchronized", { exact: true }),
  ).toBeVisible();
};
const trade = async (page: Page) => {
  await page
    .getByRole("button", { name: "Trade with the table", exact: true })
    .click();
  return page.getByRole("dialog");
};

test("planting, harvest payout, pending deduplication and failure recovery", async ({
  page,
}) => {
  await open(page);
  await expect(
    page
      .getByRole("article", { name: "Field 1" })
      .getByRole("button", { name: "Harvest 2 coins" }),
  ).toBeEnabled();
  await page
    .getByRole("button", { name: "Select peas from hand, 3 available" })
    .click();
  await expect(
    page.getByRole("button", { name: "Different crop" }),
  ).toBeDisabled();
  await page.evaluate(() => {
    window.boardTest.pause(true);
    window.boardTest.fail();
  });
  await page.getByRole("button", { name: "Plant here · field 2" }).click();
  await expect(
    page.getByRole("button", { name: "Plant here · field 2" }),
  ).toBeDisabled();
  await expect(
    page.getByRole("button", { name: "Open market", exact: true }),
  ).toBeDisabled();
  await page.evaluate(() => window.boardTest.complete());
  await expect(page.getByRole("alert")).toContainText("Your selection is kept");
  await expect(
    page.getByRole("button", { name: "Select peas from hand, 3 available" }),
  ).toHaveAttribute("aria-pressed", "true");
  expect(await page.evaluate(() => window.boardTest.calls)).toEqual([
    { name: "plant", args: [{ source: "hand", cardId: 1 }, 1] },
  ]);
  await page.evaluate(() => window.boardTest.pause(false));
  await page.getByRole("button", { name: "Plant here · field 2" }).click();
  await expect(
    page.getByRole("button", { name: "Cancel selection" }),
  ).toHaveCount(0);
  await page
    .getByRole("article", { name: "Field 1" })
    .getByRole("button", { name: "Harvest 2 coins" })
    .click();
  expect(await page.evaluate(() => window.boardTest.calls.at(-1))).toEqual({
    name: "harvest",
    args: [0],
  });
});

test("purchases show configured prices, stock, ownership and unchanged eligibility", async ({
  page,
}) => {
  await open(page);
  await page.getByRole("button", { name: "Buy tractor", exact: true }).click();
  expect(await page.evaluate(() => window.boardTest.calls.at(-1))).toEqual({
    name: "buy",
    args: ["tractor"],
  });
  await page
    .getByRole("button", { name: "Buy three cards", exact: true })
    .click();
  await page.getByRole("button", { name: /Add field/ }).click();
  await page.getByRole("button", { name: "Choose field for manure" }).click();
  await expect(page.getByRole("button", { name: /^Field 1 / })).toBeDisabled();
  await page.getByRole("button", { name: /^Field 2 / }).click();
  expect(await page.evaluate(() => window.boardTest.calls.at(-1))).toEqual({
    name: "buy",
    args: ["manure", 1],
  });
  await page.evaluate(() => {
    const g = window.boardTest.fixture();
    g.players[0].tractor = true;
    g.players[0].hasBoughtCards = true;
    g.players[0].money = 0;
    window.boardTest.snapshot(g);
  });
  await expect(
    page.getByRole("button", { name: "Buy tractor" }),
  ).toBeDisabled();
  await expect(
    page.getByRole("button", { name: "Buy three cards" }),
  ).toBeDisabled();
  await expect(page.getByRole("button", { name: /^Field 2 / })).toBeDisabled();
  await expect(page.getByText("Not enough coins")).toBeVisible();
  // Existing field control remains enabled even with insufficient funds; the core may no-op.
  await expect(page.getByRole("button", { name: /Add field/ })).toBeEnabled();
});

test("trade draft survives snapshots, close/reopen and failures; stale market is explicit", async ({
  page,
}) => {
  await open(page);
  let dialog = await trade(page);
  await dialog.getByRole("button", { name: "Include market tomato 1" }).click();
  await dialog.getByRole("button", { name: "Give more peas" }).click();
  await dialog.getByLabel("Crop to request").selectOption("2");
  await page.evaluate(() => {
    const g = window.boardTest.fixture();
    g.players[1].money = 9;
    window.boardTest.snapshot(g);
  });
  await expect(
    dialog.getByRole("button", { name: "Include market tomato 1" }),
  ).toHaveAttribute("aria-pressed", "true");
  await dialog.getByRole("button", { name: "Close trading" }).click();
  dialog = await trade(page);
  await expect(dialog.getByLabel("peas to give")).toHaveText("1");
  await page.evaluate(() => window.boardTest.fail());
  await dialog.getByRole("button", { name: "Send offer", exact: true }).click();
  await expect(dialog.getByRole("alert")).toContainText(
    "could not be completed",
  );
  await expect(dialog.getByLabel("peas to give")).toHaveText("1");
  await page.evaluate(() => {
    const g = window.boardTest.fixture();
    g.currentPlayer.marketingCards.reverse();
    window.boardTest.snapshot(g);
  });
  await expect(dialog.getByText(/The market changed/i)).toBeVisible();
  await expect(
    dialog.getByRole("button", { name: "Send offer", exact: true }),
  ).toBeDisabled();
  await dialog.getByRole("button", { name: "Clear draft" }).click();
  await dialog.getByRole("button", { name: "Include market peas 1" }).click();
  await dialog.getByRole("button", { name: "Send offer", exact: true }).click();
  await expect(
    dialog.getByRole("button", { name: "Include market peas 1" }),
  ).toHaveAttribute("aria-pressed", "false");
  const commands = await page.evaluate(() => window.boardTest.calls);
  expect(commands[0]).toEqual({
    name: "propose",
    args: [
      {
        marketCards: [{ id: 3, quantity: 1, index: 0 }],
        give: { handCards: [{ id: 1, quantity: 1 }], hats: [] },
        receive: {
          expectedCards: [{ id: 2, quantity: 1 }],
          expectedHats: false,
        },
      },
      false,
    ],
  });
});

test("incoming offers and counteroffers give cards in the correct direction", async ({
  page,
}) => {
  await open(page);
  await page.evaluate(() =>
    window.boardTest.snapshot(window.boardTest.incoming()),
  );
  await page.getByRole("button", { name: "View incoming offer" }).click();
  const dialog = page.getByRole("dialog");
  await expect(
    dialog.getByRole("region", { name: "Incoming offer" }),
  ).toContainText("You give");
  await dialog
    .getByRole("button", { name: "Accept offer", exact: true })
    .click();
  expect(await page.evaluate(() => window.boardTest.calls.at(-1))).toEqual({
    name: "respond",
    args: [true],
  });
  await dialog.getByRole("button", { name: "Make a counteroffer" }).click();
  await dialog.getByRole("button", { name: "Include market tomato 1" }).click();
  await dialog.getByRole("button", { name: "Give more peas" }).click();
  await dialog
    .getByRole("button", { name: "Send counteroffer", exact: true })
    .click();
  expect(
    await page.evaluate(() => window.boardTest.calls.at(-1)?.args[1]),
  ).toBe(true);
});

test("active player confirms counteroffers and received crops use trade planting", async ({
  page,
}) => {
  await open(page);
  await page.evaluate(() => {
    const g = window.boardTest.fixture();
    const incoming = window.boardTest.incoming().currentPlayer.tradeProposal!;
    g.currentPlayer.tradeProposal = {
      proposerTradeOffer: incoming.proposerTradeOffer,
      playersDeals: [
        {
          playerId: 1,
          accepted: null,
          newTradeOffer: {
            marketCards: [{ id: 3, quantity: 1, index: 0 }],
            give: { handCards: [{ id: 2, quantity: 1 }], hats: [] },
            receive: {
              expectedCards: [{ id: 1, quantity: 1 }],
              expectedHats: false,
            },
          },
        },
      ],
    };
    window.boardTest.snapshot(g);
  });
  const dialog = await trade(page);
  await expect(dialog.getByText("Counteroffer", { exact: true })).toBeVisible();
  await dialog
    .getByRole("button", { name: "Confirm exchange with Maya" })
    .click();
  expect(await page.evaluate(() => window.boardTest.calls.at(-1))).toEqual({
    name: "accept",
    args: [1, true],
  });
  await dialog.getByRole("button", { name: "Close trading" }).click();
  await page.evaluate(() => {
    const g = window.boardTest.fixture();
    g.players[0].acceptedTrade = [{ id: 1, quantity: 2 }];
    window.boardTest.snapshot(g);
  });
  await page.getByRole("button", { name: "Plant received peas" }).click();
  await page.getByRole("button", { name: "Plant here · field 2" }).click();
  expect(await page.evaluate(() => window.boardTest.calls.at(-1))).toEqual({
    name: "plant",
    args: [{ source: "trade", cardId: 1 }, 1],
  });
  await expect(
    page.getByRole("button", { name: "Open market", exact: true }),
  ).toBeEnabled();
});

test("room lifecycle, cached data, retry and room switch never permit stale moves", async ({
  page,
  context,
}) => {
  await open(page);
  await page.evaluate(() =>
    window.boardTest.event({
      exists: true,
      game: window.boardTest.fixture(),
      fromCache: true,
      hasPendingWrites: false,
    }),
  );
  await expect(
    page.getByText("Syncing · moves paused", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Open market", exact: true }),
  ).toBeDisabled();
  await page.evaluate(() => {
    window.boardTest.pause(true);
    window.boardTest.switchRoom("another-room");
  });
  await expect(
    page.getByRole("heading", { name: "Setting the table" }),
  ).toBeVisible();
  await expect(page.getByRole("region", { name: "Your hand" })).toHaveCount(0);
  await page.evaluate(() =>
    window.boardTest.event({
      exists: false,
      game: null,
      fromCache: false,
      hasPendingWrites: false,
    }),
  );
  await expect(
    page.getByRole("heading", { name: "This room is no longer available" }),
  ).toBeVisible();
  await page.evaluate(() => window.boardTest.error("permission-denied"));
  await expect(
    page.getByRole("heading", { name: "We couldn’t open this game" }),
  ).toBeVisible();
  await page.evaluate(() => window.boardTest.pause(false));
  await page.getByRole("button", { name: "Try connecting again" }).click();
  await expect(
    page.getByText("Table synchronized", { exact: true }),
  ).toBeVisible();
  await page.evaluate(() => {
    window.boardTest.pause(true);
  });
  await context.setOffline(true);
  await expect(
    page.getByText("Offline · moves paused", { exact: true }),
  ).toBeVisible();
  await context.setOffline(false);
  await expect(
    page.getByText("Syncing · moves paused", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Open market", exact: true }),
  ).toBeDisabled();
  await page.evaluate(() =>
    window.boardTest.snapshot(window.boardTest.fixture()),
  );
  await expect(
    page.getByRole("button", { name: "Open market", exact: true }),
  ).toBeEnabled();
});

test("turn changes clear draft, keyboard focus stays in dialog and returns to opener", async ({
  page,
}) => {
  await open(page);
  const opener = page.getByRole("button", {
    name: "Trade with the table",
    exact: true,
  });
  await opener.focus();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog");
  await expect(
    dialog.getByRole("button", { name: "Close trading" }),
  ).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  expect(
    await dialog.evaluate((el) => el.contains(document.activeElement)),
  ).toBe(true);
  await dialog.getByRole("button", { name: "Include market tomato 1" }).click();
  await page.keyboard.press("Escape");
  await expect(opener).toBeFocused();
  await page.evaluate(() => {
    const g = window.boardTest.fixture();
    g.round = 3;
    window.boardTest.snapshot(g);
  });
  await opener.click();
  await expect(
    dialog.getByRole("button", { name: "Include market tomato 1" }),
  ).toHaveAttribute("aria-pressed", "false");
});

for (const size of [
  { width: 1280, height: 800 },
  { width: 1440, height: 900 },
  { width: 390, height: 844 },
]) {
  test(`board and trading fit ${size.width}×${size.height}`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize(size);
    await open(page);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: testInfo.outputPath(`board-${size.width}.png`),
      fullPage: false,
    });
    const dialog = await trade(page);
    await expect(dialog).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    if (size.width >= 1024) {
      const hand = await page
        .getByRole("region", { name: "Your hand" })
        .boundingBox();
      const panel = await dialog.boundingBox();
      expect(hand!.x + hand!.width).toBeLessThanOrEqual(panel!.x);
    }
    await page.screenshot({
      path: testInfo.outputPath(`trade-${size.width}.png`),
      fullPage: false,
    });
  });
}

test("remote hand changes invalidate a draft and market planting keeps the card index", async ({
  page,
}) => {
  await open(page);
  const dialog = await trade(page);
  await dialog.getByRole("button", { name: "Include market tomato 1" }).click();
  await dialog.getByRole("button", { name: "Give more peas" }).click();
  await page.evaluate(() => {
    const g = window.boardTest.fixture();
    g.players[0].hand = g.players[0].hand.filter((c) => c.id !== 1);
    window.boardTest.snapshot(g);
  });
  await expect(dialog.getByRole("alert")).toContainText("Your hand changed");
  await expect(
    dialog.getByRole("button", { name: "Send offer", exact: true }),
  ).toBeDisabled();
  await dialog.getByRole("button", { name: "Clear draft" }).click();
  await dialog.getByRole("button", { name: "Close trading" }).click();
  await page.getByRole("button", { name: "Select market tomato 1" }).click();
  await page.getByRole("button", { name: "Plant here · field 1" }).click();
  expect(await page.evaluate(() => window.boardTest.calls.at(-1))).toEqual({
    name: "plant",
    args: [{ source: "market", cardId: 3, index: 0 }, 0],
  });
});

test("phase controls and existing zero-payout and stock rules remain available", async ({
  page,
}) => {
  await open(page);
  await page.evaluate(() => {
    const g = window.boardTest.fixture();
    g.currentPlayer.plantCounts = 2;
    g.players[0].fields[0].crops!.quantity = 1;
    g.availableTractors = 0;
    window.boardTest.snapshot(g);
  });
  await expect(
    page.getByRole("button", { name: "Select peas from hand, 3 available" }),
  ).toBeDisabled();
  await expect(page.getByText(/planting allowance is used/)).toBeVisible();
  await expect(
    page
      .getByRole("article", { name: "Field 1" })
      .getByRole("button", { name: "Harvest 0 coins" }),
  ).toBeEnabled();
  await expect(page.getByRole("button", { name: "Buy tractor" })).toBeEnabled();
  await page.getByRole("button", { name: "Open market", exact: true }).click();
  expect(await page.evaluate(() => window.boardTest.calls.at(-1))).toEqual({
    name: "advance",
    args: [],
  });
  await page.evaluate(() => {
    const g = window.boardTest.fixture();
    g.currentPlayer.turnStatus = "marketing";
    g.players[0].acceptedTrade = [{ id: 1, quantity: 1 }];
    window.boardTest.snapshot(g);
  });
  await page.getByRole("button", { name: "Draw 2 cards & pass turn" }).click();
  expect(
    await page.evaluate(
      () => window.boardTest.calls.filter((c) => c.name === "advance").length,
    ),
  ).toBe(2);
});
