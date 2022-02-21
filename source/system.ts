import { randomUUID } from "crypto";
import * as pathToRegexp from "path-to-regexp";
import { ActionHandlerBuilder } from "./action-handler";

export class RequestContext {
  requestId: string;

  constructor(requestId: string) {
    this.requestId = requestId;
  }

  body?: { [x: string]: any };

  set(key: string, data: { [x: string]: any }) {
    if (key === "body") {
      this.body = data;
    }
  }

  get(key: string) {
    if (key === "body") {
      return this.body;
    }
  }
}

export class SystemHandlerError extends Error {
  cause?: Error;
  constructor(reason: string, cause: Error) {
    super();

    this.message = `System could not handle that due to "${reason}".`;

    this.cause = cause;
  }
}

interface SystemConfig {
  usePattern?: boolean;
}

/**
 * System is the Top Layer of abstraction. It is the place
 * where you register Action Handlers and you execute those
 * handlers.
 *
 * A System wraps those handlers in some basic boilerplate,
 * traces them, and keeps track of some buffered metadata about
 * itself.
 */
export class System {
  #actionHandlers: Map<string, ActionHandlerBuilder[]>;
  #preware: ActionHandlerBuilder[];
  #postware: ActionHandlerBuilder[];

  config: SystemConfig;
  constructor(config = {} as SystemConfig) {
    this.#actionHandlers = new Map();
    this.#preware = [];
    this.#postware = [];
    this.config = config;
  }

  handlersFor(action: string) {
    return this.#actionHandlers.get(action) || [];
  }

  addHandler(action: string, handler: ActionHandlerBuilder) {
    const handlers = this.handlersFor(action);

    this.#actionHandlers.set(action, handlers.concat(handler));

    return this;
  }

  when(action: string) {
    const ah = new ActionHandlerBuilder();

    this.addHandler(action, ah);

    return ah;
  }

  beforeAll() {
    const ah = new ActionHandlerBuilder();

    this.#preware.push(ah);

    return ah;
  }

  afterAll() {
    const ah = new ActionHandlerBuilder();

    this.#postware.push(ah);

    return ah;
  }

  async handle(actionType: string, payload: { [x: string]: any }) {
    const id = randomUUID({ disableEntropyCache: true });

    const context = new RequestContext(id);

    const action = {
      id,
      meta: {
        received_at: new Date().toISOString(),
      },
      type: actionType as unknown as string,
      payload,
    };

    try {
      for (const handler of this.#preware) {
        await handler.exec(context, action);
      }

      if (this.config.usePattern) {
        for (const actionPattern of this.#actionHandlers.keys()) {
          const keys: any[] = [];
          const actionStr = actionPattern;

          const regexp = pathToRegexp.pathToRegexp(actionStr, keys);
          const matches = regexp.exec(actionType);
          if (matches) {
            for (const handler of this.handlersFor(actionPattern)) {
              await handler.exec(context, {
                ...action,
                meta: {
                  ...action.meta,
                  params: keys.reduce(
                    (a, { name }, index) => ({
                      ...a,
                      [name]: matches[index + 1],
                    }),
                    {}
                  ),
                },
              });
            }
          }
        }
      } else {
        for (const handler of this.handlersFor(actionType)) {
          await handler.exec(context, action);
        }
      }

      for (const handler of this.#postware) {
        await handler.exec(context, action);
      }

      return context;
    } catch (e) {
      throw new SystemHandlerError("Internal Handler Error", e as any);
    }
  }
}
