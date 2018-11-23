'use strict'

const process = require('process')

const moize = require('moize').default

const { getOptions } = require('./options')
const EVENTS = require('./events')
const { emitLimitedWarning } = require('./limit')

// Add event handling for all process-related errors
const init = function(opts) {
  const optsA = getOptions({ opts })

  const listeners = addListeners({ opts: optsA })
  const removeAll = removeListeners.bind(null, listeners)
  return removeAll
}

const addListeners = function({ opts }) {
  return Object.entries(EVENTS).map(([eventName, eventFunc]) =>
    addListener({ opts, eventName, eventFunc }),
  )
}

const addListener = function({ opts, eventName, eventFunc }) {
  // `previousEvents` is `eventName`-specific so that if events of a given
  // `eventName` stopped being emitted, others still are.
  // `previousEvents` can take up some memory, but it should be cleaned up
  // by `removeListener()`, i.e. once `eventListener` is garbage collected.
  const previousEvents = new Set()
  // Should only emit the warning once per `eventName` and per `init()`
  const mEmitLimitedWarning = moize(emitLimitedWarning)

  const eventListener = eventFunc.bind(null, {
    opts,
    eventName,
    previousEvents,
    mEmitLimitedWarning,
  })
  process.on(eventName, eventListener)

  return { eventListener, eventName }
}

// Remove all event handlers
const removeListeners = function(listeners) {
  listeners.forEach(removeListener)
}

const removeListener = function({ eventListener, eventName }) {
  // TODO: use `process.off()` instead of `process.removeListener()`
  // after dropping Node.js <10 support
  process.removeListener(eventName, eventListener)
}

module.exports = {
  init,
}