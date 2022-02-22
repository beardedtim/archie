import type { RequestHandler } from "express";
import Server from "./server";
import System, { Actions } from "./system";
import { Plugins } from "../source";

const always = (v: any) => () => v;

System.register("database", {
  query: async (str: string, args: any[]) => ({ rows: [] }),
}).register("cache", {
  set: async (...args: any[]) => {},
  get: async (...args: any[]) => {},
  has: async (...args: any[]) => {},
});
/**
 * When some ACTION occours
 */
System.when(Actions.HEALTHCHECK)
  .validate(async (ctx, action) => {
    // Any action or context before now is valid
    return true;
  })
  /**
   * Do some list of things
   */
  .do(async (ctx, action) => {
    console.log("System handling HEALTHCHECK action", action);
    console.log("Maybe we go out and check Database connections, or whatever");

    ctx.set("body", {
      data: {
        healthy: true,
      },
    });
  });

/**
 * We can also add ActionHandlers to run
 * before _any_ action
 */
System.beforeAll().do(async (ctx, action) => {
  console.debug("Request Trace Before: ", action);
});

/**
 * Or _after_ any action
 */
System.afterAll().do(async (ctx, action) => {
  console.debug("Request Trace After: ", action);
  console.debug("Context Body: ", ctx.get("body"));
});

/**
 * You can manually handle the triggering of the system
 * via some external event, such as an Express Request Handler
 */
const healthcheckRouter: RequestHandler = async (req, res, next) => {
  /**
   * We ask the system to handle some action and payload
   * and it gives us back some context that may or may
   * not have a body.
   *
   * handle will throw a User-Friendly Error Message plus
   * a detailed stack-trace of the cause.
   *
   * System uses Error throwing as a way to bail going down
   * the pipeline. In future versions of System, it will
   * throw less errors _externaly_ but will lean on throwing
   * _internally_ from ActionHandlers to end the processing.
   */
  const ctx = await System.handle(
    Actions.HEALTHCHECK,
    Plugins.Express.actionFromRequest(req).payload
  );

  /**
   * You can do whatever you want with the context at this point
   * and the System has been "successfully" cycled
   */
  res.json(ctx.get("body"));
};

/**
 * And attach it to the external system manuall
 */
Server.get("/healthcheck", healthcheckRouter);

/**
 * Or you can use a plugin and just have the System
 * generically handle the external request
 */
Server.use(Plugins.Express.middleware(System));

System.when("/:foo")
  .validate(async (ctx, action) => {
    // we want to make sure that we _have_ a method or something
    return action.payload && action.payload.method;
  })
  /**
   * You can call runtime predicates against the
   * action
   */
  .where(async (action) => action.payload.method === "get")
  .do(async (ctx, action) => {
    console.log("I am doing anything that starts with /:foo", action.meta);
  });

System.when("/adam")
  .validate(always(Promise.resolve(true)))
  .do(async (ctx, action) => {
    console.log("I am doing something specifically with /adam", action.meta);
  });

System.when("/dep-inject")
  .validate(always(Promise.resolve(true)))
  .do(async (ctx, action) => {
    console.log("Action: ", action);
    const database = System.getModule("database");
    const cache = System.getModule("cache");

    console.log(
      "I also have access to the Database and the Cache",
      database,
      cache
    );
  });

Server.listen(9001, () => {
  console.log("Listening");
});
