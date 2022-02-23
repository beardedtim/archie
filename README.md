# Archie

A way to build _processors_ that _do things_ and result in
_some context_ being set across them.

## Usage

> You can find full-fledged examples inside of `/examples`
> if you want to see how this might look in real-life

### PING -> PONG

Here is an example of a system sending messages to itself in order
to respond to a specific question. This proves that each invocation
is a new closure/ran each time and that the systems can be nested.

```ts
enum Actions {
  PING = "PING",
  PONG = "PONG",
}

RootSystem.when(Actions.PING)
  .validate(always(Promise.resolve(true)))
  .do(async (ctx, action) => {
    const pingSymbol = Symbol("New Ping");
    const result = await RootSystem.handle(Actions.PONG, {
      id: pingSymbol,
    });

    ctx.set("body", result.get("body") === pingSymbol);
  });

RootSystem.when(Actions.PONG)
  .validate(always(Promise.resolve(true)))
  .do(async (ctx, action) => {
    ctx.set("body", action.payload.id);
  });

const pingSuccessful = await RootSystem.handle(Actions.PING, {});

console.log(pingSuccessful.get("body")); // true
```

### Express Integration

```ts
/**
 * You can manually handle the triggering of the system
 * via some external event, such as an Express Request Handler
 */
const healthcheckRouter: RequestHandler = async (req, res, next) => {
  const ctx = await System.handle(
    Actions.HEALTHCHECK,
    Plugins.Express.actionFromRequest(req).payload
  );

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
  .where(async (action) => action.payload.method === "get")
  .do(async (ctx, action) => {
    console.log("I am doing anything that starts with /:foo and is a GET request", action.meta);
  });
```

### Nested Systems

```ts
import { System, Log } from "@beardedtim/archie";
import { randomUUID } from "crypto";

const CruddySystem = new System({
  name: "Cruddy",
  usePattern: true,
  // ignore validation for demo purposes
  useManualActionValidation: true
});

const UserSystem = new System({
  name: "Cruddy::User",
  // ignore validation for demo purposes
  useManualActionValidation: true
});

UserSystem.when("CREATE").do(async (ctx, action) => {
  if (!action.payload.body) {
    console.log(action, "action");
    throw new Error("Missing Body for Creating of User");
  }

  ctx.set("body", {
    id: "123-456",
    name: action.payload.body.name,
  });
});

CruddySystem.beforeAll().do(async (ctx, action) => {
  const traceId = randomUUID({ disableEntropyCache: true });

  ctx.set("trace-id", traceId);

  Log.trace({ action, traceId }, "Handling");
});

CruddySystem.afterAll().do(async (ctx, action) => {
  const traceId = ctx.get("trace-id");

  Log.trace({ action, traceId }, "Handled");
});

CruddySystem.when("foobar").do(async (ctx, action) => {
  Log.debug({ action }, "I am the event handler");

  // Systems can call Systems
  const result = await UserSystem.handle("CREATE", {
    body: {
      name: "Tim",
    },
  });

  ctx.set("body", {
    data: result.get("body"),
  });
});

const main = async () => {
  const result = await CruddySystem.handle("foobar", {
    some: "payload",
  });

  console.log(result.get("body"), result.get("trace-id"));
};

main();
```

### Helpers

#### validateByJSONSchema

This allows you to say that the `action.payload` value will
match a specific JSON Schema

```ts
const healthcheckSchema = {
  type: "object",
  required: ["hello"],
  properties: {
    hello: {
      type: "string",
    },
  },
};

/**
 * When some ACTION occours
 */
System.when(Actions.HEALTHCHECK)
  .validate(Helpers.validateByJSONScema(healthcheckSchema))
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
```

### Generating Docs

A System comes built with the ability to have docs generated for it. Right now, the docs are sparse
but the interfaces are built and ready for consuming.

```ts
import { Doc } from '@beardedtim/archie'

/**
 * Somehow build up a UserSystem
 */
  const UserDocs = new Doc(UserSystem);
  console.log(UserDocs.generate());
  console.log();
```

prints something like

```
# System: User

- Uses Patterns:  No


## Actions

- Action CREATE
    - validateUserCreation
    - createUser
  

- Action READ_ONE
    - readUserById
```

to the console.

**NOTE** If you do not name the functions you pass to `do`, they will be a blank line.
Always make the function you pass to `do` a _named_ function (`const foo = () => { ... }`)
if you intend on using the Documentation Generation in any serious way.

## Demo

```sh
git clone git@github.com:beardedtim/archie.git

npm i

yarn ts-node demo/index.ts
```

## Reasoning

I wanted a way to build an _action processor_ that held some _state_
between the pipeline processors. I also wanted to remove any concept
of HTTP/WS/Whatever from the _unit of value_ that I think action processing
offers. 

Instead of tying the middleware processor to some HTTP library like Express,
I am trying to build our system in a way that is _agnostic_ from the outside
world in a _meaningful_ way. I am trying to keep the _unit of value_ as the
modification of _context_ given some _action_ and _action handlers_. 

## Terminology

### Action

An _Action_ is an internal representation of some _request_ or
_external thing_ that can be handled within the system.

### Context

A _Context_ is some shared _state_ between Action Handlers

### Action Handler

An _Action Handler_ is responsible for taking in the tuple (Context, Action) and
_doing_ something with that, including setting some shared value on Context.

### System

A _System_ is a grouping of Action Handlers, Preware, and Postware. It is
responsible for taking in some request, processing it, and returning some
output.

### Plugins

A way to interact with external _things_ such as Express in an _abstract_ way.