# Archie

A way to build _processors_ that _do things_ and result in
_some context_ being set across them.

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