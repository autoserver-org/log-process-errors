'use strict'

const { printMultiline, print, prettify } = require('./serialize')

// Retrieve `message` which sums up all information that can be gathered about
// the event.
const getMessage = function({
  eventName,
  promiseState,
  promiseValue,
  secondPromiseState,
  secondPromiseValue,
  error,
  level,
}) {
  const message = MESSAGES[eventName]({
    promiseState,
    promiseValue,
    secondPromiseState,
    secondPromiseValue,
    error,
  })

  const messageA = prettify({ message, eventName, level })
  return messageA
}

const uncaughtException = function({ error }) {
  return `An exception was thrown but not caught
${print(error)}`
}

const warning = function({ error, error: { code, detail = '' } }) {
  const codeMessage = code === undefined ? '' : `(${code}) `
  return `${codeMessage}${detail}
${print(error)}`
}

const unhandledRejection = function({ promiseValue }) {
  return `A promise was rejected but not handled
Promise was rejected with: ${printMultiline(promiseValue)}`
}

const rejectionHandled = function({ promiseValue }) {
  return `A promise was handled after being already rejected
Promise was rejected with: ${printMultiline(promiseValue)}`
}

const multipleResolves = function({
  promiseState,
  promiseValue,
  secondPromiseState,
  secondPromiseValue,
}) {
  const again = promiseState === secondPromiseState ? ' again' : ''
  return `A promise was resolved/rejected multiple times
Promise was initially ${promiseState} with: ${printMultiline(promiseValue)}
Promise was then ${secondPromiseState}${again} with: ${printMultiline(
    secondPromiseValue,
  )}`
}

const MESSAGES = {
  uncaughtException,
  warning,
  unhandledRejection,
  rejectionHandled,
  multipleResolves,
}

module.exports = {
  getMessage,
}
