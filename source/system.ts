import type { Actions } from "./types";
import { ActionHandlerBuilder } from "./action-handler";

export class RequestContext {
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

export class System {
  #actionHandlers: Map<Actions, ActionHandlerBuilder[]>;
  #preware: ActionHandlerBuilder[];
  #postware: ActionHandlerBuilder[];

  constructor() {
    this.#actionHandlers = new Map();
    this.#preware = [];
    this.#postware = [];
  }

  handlersFor(action: Actions) {
    return this.#actionHandlers.get(action) || [];
  }

  addHandler(action: Actions, handler: ActionHandlerBuilder) {
    const handlers = this.handlersFor(action);
    this.#actionHandlers.set(action, [...handlers, handler]);

    return this;
  }

  when(action: Actions) {
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

  async handle(actionType: Actions, payload: { [x: string]: any }) {
    const context = new RequestContext();

    const action = {
      type: actionType,
      payload,
      meta: {
        received_at: new Date().toISOString(),
      },
    };

    try {
      for (const handler of this.#preware) {
        await handler.exec(context, action);
      }

      for (const handler of this.handlersFor(actionType)) {
        await handler.exec(context, action);
      }

      for (const handler of this.#postware) {
        await handler.exec(context, action);
      }
    } catch (e) {
      throw new SystemHandlerError("Internal Handler Error", e as any);
    }
  }
}
