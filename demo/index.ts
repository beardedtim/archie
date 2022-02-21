import type { RequestHandler } from "express";
import Server from "./server";
import System, { Actions } from "./system";

/**
 * When some ACTION occours
 */
System.when(Actions.HEALTHCHECK)
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
  console.debug("Request Trace: ", action);
});

/**
 * Or _after_ any action
 */
System.afterAll().do(async (ctx, action) => {
  console.debug("Request Trace: ", action);
  console.debug("Request Body: ", ctx.get("body"));
});

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
  const ctx = await System.handle(Actions.HEALTHCHECK, {
    url: req.url,
    params: req.params,
  });

  /**
   * You can do whatever you want with the context at this point
   * and the Syste, has been "successfully" cycled
   */
  res.json(ctx.get("body"));
};

Server.get("/healthcheck", healthcheckRouter);

Server.listen(9001, () => {
  console.log("Listening");
});
