import { version } from 'process'

import test from 'ava'
import { each } from 'test-each'

import { EVENTS } from '../helpers/events/main.js'
import { RUNNERS } from '../helpers/testing/runners.js'
import { normalizeCall } from '../helpers/normalize.js'
import { removeProcessListeners } from '../helpers/remove.js'

const HELPER_DIR = `${__dirname}/../helpers/testing`

removeProcessListeners()

const shouldSkip = function({ runner, eventName }) {
  return (
    isAvaRejectionHandled({ runner, eventName }) ||
    isOldNodeTap({ runner, eventName })
  )
}

// Ava handling of rejectionHandled is not predictable, i.e. make tests
// randomly fail
const isAvaRejectionHandled = function({ runner, eventName }) {
  return runner === 'ava' && eventName === 'rejectionHandled'
}

// `node-tap` testing is challenging for `rejectionHandled` and
// `unhandledRejection`. It fails but only locally (not in CI) and only for
// Node 8. Considering `node-tap` is doing lots of monkey-patching, we give up
// on testing that combination.
const isOldNodeTap = function({ runner, eventName }) {
  return (
    runner.startsWith('node-tap') &&
    ['rejectionHandled', 'unhandledRejection'].includes(eventName) &&
    version.startsWith('v8.')
  )
}

const callRunner = async function({
  testing,
  command,
  env,
  eventName,
  opts,
  register,
}) {
  const helperFile = getHelperFile({ testing, register })
  const optsA = { eventName, testing, ...opts }
  const commandA = command(helperFile)
  const returnValue = await normalizeCall(commandA, {
    // Test runners have different CI output sometimes.
    env: { OPTIONS: JSON.stringify(optsA), CI: '1', ...env },
  })
  return returnValue
}

const getHelperFile = function({ testing, register }) {
  const helperDir = testing === 'ava' ? __dirname : HELPER_DIR
  const filename = register ? 'register' : 'regular'
  return `${helperDir}/${testing}/${filename}.js`
}

each(
  EVENTS,
  RUNNERS,
  ({ title }, { eventName }, { title: runner, command, env }) => {
    const [testing] = runner.split(':')

    if (shouldSkip({ runner, eventName })) {
      return
    }

    test(`should make tests fails | ${title}`, async t => {
      const returnValue = await callRunner({ testing, command, env, eventName })

      t.snapshot(returnValue)
    })

    test(`should allow overriding 'opts.level' | ${title}`, async t => {
      const returnValue = await callRunner({
        testing,
        command,
        env,
        eventName,
        opts: { level: { default: 'silent' } },
      })

      t.snapshot(returnValue)
    })

    test(`should work with the -r flag | ${title}`, async t => {
      const returnValue = await callRunner({
        testing,
        command,
        env,
        eventName,
        register: true,
      })

      t.snapshot(returnValue)
    })
  },
)
