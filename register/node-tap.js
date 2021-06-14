// istanbul ignore file
// Look for `spawn-wrap` in the codebase to see why Istanbul cannot cover this.
/* eslint-disable filenames/match-regex, unicorn/filename-case */
// Meant to be performed as `node -r log-process-errors/node-tap.js`
// or `import 'log-process-errors/node-tap.js'`.
import logProcessErrors from '../src/main.js'

logProcessErrors({ testing: 'node-tap' })
/* eslint-enable filenames/match-regex, unicorn/filename-case */
