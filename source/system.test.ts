import test from "ava";
import { System } from "./system";

test("Systems call handlers in order", async (assert) => {
  assert.plan(2);

  const system = new System();

  system.when("HEALTHCHECK").do(
    async (ctx, action) => {
      const oldBody = ctx.get("body");

      assert.is(undefined, oldBody, "There is no old body");

      ctx.set("body", {
        data: true,
      });
    },
    async (ctx, action) => {
      const oldBody = ctx.get("body");

      assert.not(undefined, oldBody, "There is an old body");

      ctx.set("body", {
        data: {
          oldBody,
        },
      });
    }
  );

  system.handle("HEALTHCHECK", {
    hello: "world",
  });
});

test("System can handle multile calls to when", async (assert) => {
  assert.plan(2);

  const system = new System();

  system.when("HEALTHCHECK").do(async (ctx) => {
    const oldBody = ctx.get("body");

    assert.is(undefined, oldBody, "There is no old body");

    ctx.set("body", true);
  });

  system.when("HEALTHCHECK").do(async (ctx) => {
    const oldbody = ctx.get("body");

    assert.not(undefined, oldbody, "There is an old body");
  });

  await system.handle("HEALTHCHECK", {});
});

test("Preware Runs Before Every Request", async (assert) => {
  assert.plan(2);

  const system = new System();

  system.when("HEALTHCHECK").do(async (ctx) => {
    assert.is(1, ctx.get("body"), "Body is set");
  });

  system.beforeAll().do(async (ctx) => {
    assert.not(1, ctx.get("body"), "Body is not set");
    ctx.set("body", 1);
  });

  await system.handle("HEALTHCHECK", {});
});

test("Postware Runs After Every Request", async (assert) => {
  assert.plan(2);

  const system = new System();

  system.afterAll().do(async (ctx) => {
    assert.is(1, ctx.get("body"), "Body is set");
  });

  system.when("HEALTHCHECK").do(async (ctx) => {
    assert.not(1, ctx.get("body"), "Body not set");
    ctx.set("body", 1);
  });

  await system.handle("HEALTHCHECK", {});
});
