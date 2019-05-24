import test from 'ava'

// Required directly because this is exposed through documentation, but not
// through code
import { MAX_EVENTS } from '../src/limit.js'

import { repeatEvents } from './helpers/repeat.js'
import { startLogging } from './helpers/init.js'
import { emitEvents } from './helpers/several.js'
import { stubStackTraceRandom, unstubStackTrace } from './helpers/stack.js'
import { removeProcessListeners } from './helpers/remove.js'

removeProcessListeners()

repeatEvents(({ name }, { eventName, emitEvent }) => {
  test.serial(`${name} should limit events`, async t => {
    stubStackTraceRandom()

    const { stopLogging, log } = startLogging({
      log: 'spy',
      level: { default: onlyNotLimitedWarning.bind(null, eventName) },
    })

    await emitEvents(MAX_EVENTS, emitEvent)

    t.is(log.callCount, MAX_EVENTS)

    await emitEvent()

    t.is(log.callCount, MAX_EVENTS)

    stopLogging()

    unstubStackTrace()
  })

  test.serial(`${name} should emit warning when limiting events`, async t => {
    stubStackTraceRandom()

    const { stopLogging, log } = startLogging({
      log: 'spy',
      level: { default: onlyLimited },
    })

    await emitEvents(MAX_EVENTS, emitEvent)

    t.true(log.notCalled)

    await emitEvent()

    t.true(log.called)

    stopLogging()

    unstubStackTrace()
  })

  test.serial(
    `${name} should only emit warning once when limiting events`,
    async t => {
      stubStackTraceRandom()

      const { stopLogging, log } = startLogging({
        level: { default: onlyLimited },
        log: 'spy',
      })

      await emitEvents(MAX_EVENTS, emitEvent)

      await emitEvent()

      const { callCount } = log

      await emitEvent()

      t.is(log.callCount, callCount)

      stopLogging()

      unstubStackTrace()
    },
  )
})

const onlyLimited = function(error) {
  if (!isLimitedWarning(error)) {
    return 'silent'
  }
}

const onlyNotLimitedWarning = function(eventName, error) {
  if (
    isLimitedWarning(error) ||
    error.name.toLowerCase() !== eventName.toLowerCase()
  ) {
    return 'silent'
  }
}

const isLimitedWarning = function({ name, message }) {
  return name === 'Warning' && message.includes('LogProcessErrors')
}
