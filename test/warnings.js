import test from 'ava'
import sinon from 'sinon'

import { EVENTS } from './helpers/events/main.js'
import { startLogging } from './helpers/init.js'
import { normalizeMessage } from './helpers/normalize.js'
import { removeProcessListeners } from './helpers/remove.js'

removeProcessListeners()

const { warning: { emitEvent: emitWarning } } = EVENTS

test.serial('[warning] should disable default event handlers', async t => {
  // eslint-disable-next-line no-restricted-globals
  const stub = sinon.stub(console, 'error')

  const { stopLogging, log } = startLogging({ log: 'spy', colors: false })

  await emitWarning()

  t.true(log.calledOnce)
  t.snapshot(String(log.lastCall.args[0]))

  t.true(stub.notCalled)

  stopLogging()

  stub.restore()
})

test.serial(
  '[warning] should multiply restore default event handlers',
  async t => {
    // eslint-disable-next-line no-restricted-globals
    const stub = sinon.stub(console, 'error')

    const { stopLogging } = startLogging()
    startLogging().stopLogging()

    await emitWarning()

    t.true(stub.notCalled)

    stopLogging()

    await emitWarning()

    t.true(stub.calledOnce)
    t.snapshot(normalizeMessage(String(stub.lastCall.args[0])))

    stub.restore()
  },
)
