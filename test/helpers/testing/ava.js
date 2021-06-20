// eslint-disable-next-line import/no-unassigned-import, import/order, ava/no-ignored-test-files
import './stack.js'
// eslint-disable-next-line import/order
import { boundLogProcessErrors } from './call.js'

boundLogProcessErrors()

// eslint-disable-next-line import/first
import test from 'ava'

// eslint-disable-next-line import/first
import { EVENTS_MAP } from '../events/main.js'

// eslint-disable-next-line import/first
import { getOptions } from './options.js'

const { eventName } = getOptions()

// This test is fired twice:
//  - through `test/options/testing.js` (`OPTIONS` is defined)
//  - when the top-level `test/options/ava.js` is required,
//    where it should be a noop (`OPTIONS` is `undefined`)
if (eventName === undefined) {
  // Otherwise `ava` complains
  test('Dummy test', (t) => {
    t.pass()
  })
} else {
  test(`should make tests fail on ${eventName}`, (t) => {
    // eslint-disable-next-line promise/prefer-await-to-then, no-empty-function
    EVENTS_MAP[eventName].emit().catch(() => {})

    t.pass()
  })
}
