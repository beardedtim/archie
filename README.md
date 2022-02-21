# Archie

A way to build _processors_ that _do things_ and result in
_some context_ being set across them.

## Usage

```ts
import { System } from '@beardedtim/archie'

const system = new System()

// Do something(s) given some event
system.when('Some event')
    .do(
        async (ctx, action) => {
            // called 1st
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

## Demo

```sh
git clone git@github.com:beardedtim/archie.git

npm i

yarn ts-node demo/index.ts
```

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