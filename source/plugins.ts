import type { System } from "./system";
import type { RequestHandler, Request } from "express";

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

export const Express = {
  actionFromRequest: createActionFromRequest,
  middleware:
    (system: System): RequestHandler =>
    async (req, res, next) => {
      try {
        /**
         * Generically handle this request
         */
        const action = createActionFromRequest(req);

        const ctx = await system.handle(action.type, action.payload);

        res.json({ data: ctx.get("body") });
      } catch (e) {
        return next(e);
      }
    },
};
