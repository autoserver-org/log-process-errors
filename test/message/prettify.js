'use strict'

const test = require('ava')

const {
  repeatEventsLevels,
  startLogging,
  stubStackTrace,
  unstubStackTrace,
  normalizeMessage,
} = require('../helpers')

repeatEventsLevels((prefix, { name, emitEvent }, level) => {
  test(`${prefix} should fire opts.message() with a default prettifier`, async t => {
    stubStackTrace()

    const { stopLogging, log } = startLogging({
      log: 'spy',
      level: { default: level },
      colors: false,
      name,
    })

    await emitEvent()

    t.true(log.calledOnce)

    const message = normalizeMessage(log.lastCall.args[0])
    t.snapshot(message)

    stopLogging()

    unstubStackTrace()
  })
})