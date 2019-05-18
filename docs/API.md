# API

You can try all the examples below:

- either directly
  [in your browser](https://repl.it/@ehmicky/log-process-errors).
- or by executing the [`examples` files](../examples/README.md) in a terminal.

## logProcessErrors([options])

Initializes `log-process-errors`. Returns a function that can be fired to
restore Node.js default behavior.

```js
const logProcessErrors = require('log-process-errors')

const restore = logProcessErrors(options)
restore()
```

Full example:

```js
logProcessErrors({
  log(error, level) {
    winstonLogger[level](error.stack)
  },

  level: { multipleResolves: 'debug' },

  exitOn: ['uncaughtException', 'unhandledRejection'],

  testing: 'ava',

  colors: false,
})
```

### options

_Type_: `object`

#### log

_Type_: `function(error, level)`

By default process errors will be logged to the console using `console.error()`,
`console.warn()`, etc.

This behavior can be overridden with the `log` option. For example to log
process errors with [Winston](https://github.com/winstonjs/winston) instead:

```js
logProcessErrors({
  log(error, level) {
    winstonLogger[level](error.stack)
  },
})
```

The function's arguments are [`error`](#error) and [`level`](#level).

If logging is asynchronous, the function should return a promise (or use
`async`/`await`). This is not necessary if logging is using streams (like
[Winston](https://github.com/winstonjs/winston)).

Duplicate process errors are only logged once (whether the `log` option is
defined or not).

#### level

_Type_: `object`<br> _Default_:
`{ warning: 'warn', multipleResolves: 'info', default: 'error' }`

Which log level to use.

Object keys are the error names:
[`uncaughtException`](https://nodejs.org/api/process.html#process_event_uncaughtexception),
[`warning`](https://nodejs.org/api/process.html#process_event_warning),
[`unhandledRejection`](https://nodejs.org/api/process.html#process_event_unhandledrejection),
[`rejectionHandled`](https://nodejs.org/api/process.html#process_event_rejectionhandled),
[`multipleResolves`](https://nodejs.org/api/process.html#process_event_multipleresolves)
or `default`.

Object values are the log level: `'debug'`, `'info'`, `'warn'`, `'error'`,
`'silent'` or `'default'`. It can also be a function using
[`error` as argument](#error) and returning one of those log levels.

```js
logProcessErrors({
  level: {
    // Use `debug` log level for `multipleResolves` instead of `info`
    multipleResolves: 'debug',

    // Skip some logs based on a condition
    default(error) {
      return shouldSkip(error) ? 'silent' : 'default'
    },
  },
})
```

#### exitOn

_Type_: `string[]`<br> _Value_: array of
[`'uncaughtException'`](https://nodejs.org/api/process.html#process_event_uncaughtexception),
[`'unhandledRejection'`](https://nodejs.org/api/process.html#process_event_unhandledrejection),
[`'rejectionHandled'`](https://nodejs.org/api/process.html#process_event_rejectionhandled),
[`'multipleResolves'`](https://nodejs.org/api/process.html#process_event_multipleresolves)
or [`'warning'`](https://nodejs.org/api/process.html#process_event_warning)<br>
_Default_: `['uncaughtException']`

Which process errors should trigger `process.exit(1)`:

- `['uncaughtException']` is Node.js
  [default behavior](https://nodejs.org/api/process.html#process_warning_using_uncaughtexception_correctly).
- we recommend using `['uncaughtException', 'unhandledRejection']` instead since
  this will be
  [Node.js future default behavior](https://nodejs.org/dist/latest-v8.x/docs/api/deprecations.html#deprecations_dep0018_unhandled_promise_rejections).
- use `[]` to prevent any `process.exit(1)`. Recommended if your process is
  long-running and does not automatically restart on exit.

`process.exit(1)` will only be fired after successfully logging the process
error.

```js
logProcessErrors({ exitOn: ['uncaughtException', 'unhandledRejection'] })
```

#### testing

_Type_: `string`<br> _Value_: `'ava'`, `'mocha'`, `'jasmine'`, `'tape'` or
`'node-tap'`<br> _Default_: `undefined`

When running tests, makes them fail if there are any process errors.

Example with [Ava](https://github.com/avajs/ava):

<!-- eslint-disable import/order -->

```js
const logProcessErrors = require('log-process-errors')
// Should be initialized before requiring other dependencies
logProcessErrors({ testing: 'ava' })

const test = require('ava')

// Tests will fail because a warning is triggered
test('Example test', t => {
  process.emitWarning('Example warning')
  t.pass()
})
```

Alternatively, you can just require
`log-process-errors/build/register/{testRunnerName}`:

<!-- eslint-disable import/no-unassigned-import -->

```js
// Should be initialized before requiring other dependencies
require('log-process-errors/build/register/ava')

const test = require('ava')

// Tests will fail because a warning is triggered
test('Example test', t => {
  process.emitWarning('Example warning')
  t.pass()
})
```

This can also be used with
[`node -r`](https://nodejs.org/api/cli.html#cli_r_require_module) or any
equivalent CLI flag for your test runner:

```bash
ava --require log-process-errors/build/register/ava
```

To ignore specific process errors, use the [`level` option](#level):

<!-- eslint-disable import/order -->

```js
const logProcessErrors = require('log-process-errors')
// Should be initialized before requiring other dependencies
logProcessErrors({ testing: 'ava', level: { warning: 'silent' } })

const test = require('ava')

// Tests will not fail because warnings are `silent`
test('Example test', t => {
  process.emitWarning('Example warning')
  t.pass()
})
```

#### colors

_Type_: `boolean`<br> _Default_: `true` if the output is a terminal.

Colorizes messages.

```js
logProcessErrors({ colors: false })
```

### error

_Type_: `Error`

The [`log`](#log) and [`level`](#level) options receive as argument an `error`
instance.

#### error.name

_Type_: `string`<br> _Value_:
[`'UncaughtException'`](https://nodejs.org/api/process.html#process_event_uncaughtexception),
[`'UnhandledRejection'`](https://nodejs.org/api/process.html#process_event_unhandledrejection),
[`'RejectionHandled'`](https://nodejs.org/api/process.html#process_event_rejectionhandled),
[`'MultipleResolves'`](https://nodejs.org/api/process.html#process_event_multipleresolves)
or [`'Warning'`](https://nodejs.org/api/process.html#process_event_warning)

#### error.stack

`error` is prettified when using
[`console`](https://nodejs.org/api/console.html#console_console_log_data_args)
or
[`util.inspect()`](https://nodejs.org/api/util.html#util_util_inspect_object_options):

```js
console.log(error)
```

![Error prettified](error_pretty.png)

But not when using `error.stack` instead:

```js
console.log(error.stack)
```

![Error raw](error_raw.png)
