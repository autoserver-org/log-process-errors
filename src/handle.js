'use strict'

const { getInfo } = require('./info')
const { isLimited } = require('./limit')
const { isRepeated } = require('./repeat')
const { getColors } = require('./colors')
const { getLevel } = require('./level')
const { getMessage } = require('./message')
const { exitProcess } = require('./exit')

// Generic event handler for all events.
const handleEvent = async function({
  opts,
  eventName,
  previousEvents,
  mEmitLimitedWarning,
  error,
  promise,
  promiseValue,
  secondPromiseState,
  secondPromiseValue,
}) {
  if (isLimited({ previousEvents, mEmitLimitedWarning, eventName, error })) {
    return
  }

  const info = await getInfo({
    eventName,
    error,
    promise,
    promiseValue,
    secondPromiseState,
    secondPromiseValue,
  })

  if (isRepeated({ info, previousEvents })) {
    return
  }

  if (opts.skipEvent(info)) {
    return
  }

  await logEvent({ opts, info })

  await exitProcess({ eventName, opts })
}

const logEvent = async function({ opts, info }) {
  const colors = getColors({ opts })
  const level = getLevel({ opts, info })
  const message = getMessage({ opts, info, level, colors })

  // We need to `await` it in case `opts.exitOn` exits the process.
  // Without `await` Node.js would still wait until most async tasks (including
  // stream draining for logging libraries like Winston) have completed.
  // But there are some cases where it will not. In those cases, `opts.log()`
  // should be either synchronous or return a promise.
  await opts.log(message, level, info)
}

module.exports = {
  handleEvent,
}
