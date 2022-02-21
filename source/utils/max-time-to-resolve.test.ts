import test from "ava";
import { setTimeout } from "timers/promises";
import max from "./max-time-to-resolve";

test("mttr returns the promise if it resolves within time", async (assert) => {
  const value = await max(Promise.resolve(1), 1000);

  assert.is(value, 1, "Returns the resolved value immediately");
});

test("mttr throws an error if it does not resolve in time", async (assert) => {
  await assert.throwsAsync(max(setTimeout(100000), 10));
});
