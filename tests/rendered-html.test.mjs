import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("Somsy's private workout experience is wired into the app", async () => {
  const [page, layout, hosting, schema, route] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../.openai/hosting.json", import.meta.url), "utf8"),
    readFile(new URL("../db/schema.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/workouts/route.ts", import.meta.url), "utf8"),
  ]);

  assert.match(layout, /Somsy — My Private Movement Ritual/);
  assert.match(page, /Namaste, Somsy/);
  assert.match(page, /PRIVATE LEDGER/);
  assert.match(page, /daily-weight/);
  assert.match(page, /fetch\("\/api\/workouts"/);
  assert.match(hosting, /"d1": "DB"/);
  assert.match(schema, /workout_logs/);
  assert.match(route, /onConflictDoUpdate/);
  assert.doesNotMatch(page, /FORM30|Your site is taking shape/);
});
