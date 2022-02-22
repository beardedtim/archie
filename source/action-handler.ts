import type { ActionHandler, Context, Action } from "./types";

export class ActionHandlerError extends Error {
  cause?: Error;
  constructor(reason: string, cause?: Error) {
    super();
    this.message = `Action Handler Failed due to "${reason}"`;

    this.cause = cause;
  }
}

interface ActionHandlerBuilderConfig {
  validateManually?: boolean;
}

export class ActionHandlerBuilder {
  #handlers: ActionHandler[];
  #predicates: ((action: Action) => Promise<boolean>)[];
  #config: ActionHandlerBuilderConfig;
  #validator?: any;

  constructor(config: ActionHandlerBuilderConfig = {}) {
    this.#handlers = [];
    this.#predicates = [] as ((action: Action) => Promise<boolean>)[];
    this.#config = config;
  }

  validate(actionHandler: ActionHandler) {
    this.#validator = actionHandler;

    return this;
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
   * What must be true in order for us to be able to do this?
   */
  where(...predicates: ((action: Action) => Promise<boolean>)[]) {
    this.#predicates = this.#predicates.concat(predicates);

    return this;
  }

  /**
   * Given some Context and Action, exec through
   * the pipeline, in sequential order.
   */
  async exec(context: Context, action: Action) {
    console.log(this.#validator, this.#config);
    if (!this.#validator && !this.#config.validateManually) {
      console.warn(
        "You have not given this Action Handler any way to validate. This will result in undefined behavior in future verisons."
      );
      console.warn(
        "If you want this behavior, add `validateManually: true` to the configration when you build your ActionHandlerBuilder"
      );

      console.debug("This code path will throw in future versions.");
    }
    try {
      if (this.#predicates.length) {
        for (const pred of this.#predicates) {
          const passed = await pred(action);
          if (!passed) {
            return;
          }
        }
      }

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

  handlers() {
    return this.#handlers.map(({ name }, i) => name ?? `AnonHandler:${i + 1}`);
  }
}
