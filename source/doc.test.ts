import test from "ava";
import { System } from "./system";
import { Doc } from "./docs";

test("Generates Expected Doc Page", async (assert) => {
  const system = new System({
    usePattern: true,
    name: "Named System",
  });

  system.when("/:foo").do();

  const docs = new Doc(system);

  const result = await docs.generate();

  assert.snapshot(result);
});
