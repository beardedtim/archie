# Archie

A way to build _processors_ that _do things_ and result in
_some context_ being set across them.

## Usage

### Basic System

```ts
import { System } from '@beardedtim/archie'

const system = new System()

// you can register random key/values
// to the system itself that can be used
// from within the action handlers

system.register('database', {})
    .register('cache', {})
    .register('credentials', {})

// Do something(s) given some event
system.when('Some event')
    .do(
        async (ctx, action) => {
            // called 1st
            const db = system.getModule('database')
            const cache = system.getModule('cache')
        },
        async(ctx, action) =>  {
            // called 2nd
        }
    )

// Do somthing(s) gien some event
system.when('Some event')
    // but only when the action matches some predicates
    .where(async (action) => action.payload.foobar === 'baz')
    .do(...)

const resultCTX = await system.handle('Some event', {
    payload: {
        foobar: 'baz'
    }
})

const patternSystem = new System({
    usePattern: true
})

system.when('/:foo').where(async action => action.payload.method === 'get').do(...)
system.when('/adam').do(...)

await system.handle('/adam', {
    payload: {
        method: 'get'
    }
}) // /adam would be triggered and /:foo would have { payload: { params: { foo: adam } } }

await system.handle('/adam', {
    payload: {
        method: 'post'
    }
}) // /adam would be triggered but /:foo would not
```

### Nested Systems

```ts
import { System, Log } from "@beardedtim/archie";
import { randomUUID } from "crypto";

const CruddySystem = new System({
  name: "Cruddy",
  usePattern: true,
});

const UserSystem = new System({
  name: "Cruddy::User",
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