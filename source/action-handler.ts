import type { ActionHandler, Context, Action } from "./types";

export class ActionHandlerError extends Error {
  cause?: Error;
  constructor(reason: string, cause?: Error) {
    super();
    this.message = `Action Handler Failed due to "${reason}"`;

    this.cause = cause;
  }
}

export class ActionHandlerBuilder {
  #handlers: ActionHandler[];
  constructor() {
    this.#handlers = [];
  }

  /**
   * What actions do you want to do, in order
   * when this action is received?
   */
  do(...actionHandler: ActionHandler[]) {
    this.#handlers = this.#handlers.concat(actionHandler);

    return this;
  }

  /**
   * Given some Context and Action, exec through
   * the pipeline, in sequential order.
   */
  async exec(context: Context, action: Action) {
    try {
      for (const handler of this.#handlers) {
        await handler(context, action);
      }
    } catch (e) {
      throw new ActionHandlerError(
        "Some Handler threw when processing",
        e as any
      );
    }
  }
}
