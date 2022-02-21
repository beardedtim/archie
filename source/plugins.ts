import type { System } from "./system";
import type { RequestHandler, Request } from "express";
import { maxTimeToResolve } from "./utils";

const createActionFromRequest = (req: Request) => ({
  type: req.url,
  payload: {
    method: req.method.toLowerCase(),
    headers: req.headers,
    query: req.query,
    parentParams: req.params,
    body: req.body,
  },
});

export interface ExpresConfig {
  systemTimeout?: number;
}

export const Express = {
  actionFromRequest: createActionFromRequest,
  middleware:
    (system: System, config: ExpresConfig = {}): RequestHandler =>
    async (req, res, next) => {
      try {
        /**
         * Generically handle this request
         */
        const action = createActionFromRequest(req);

        // We give the system a max amount of time
        // to wait for it to respond before we throw
        // an error
        const ctx = await maxTimeToResolve(
          system.handle(action.type, action.payload),
          config.systemTimeout ?? 5000
        );

        res.json({ data: ctx.get("body") });
      } catch (e) {
        return next(e);
      }
    },
};
