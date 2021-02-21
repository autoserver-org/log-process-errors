import { circleFilled, info, warning, cross } from 'figures'

// Pretty-print error on the console (which uses `util.inspect()`)
export const printError = function ({
  opts: {
    chalk,
    chalk: { gray },
  },
  level,
  name,
  message,
  stack,
}) {
  const header = getHeader({ level, name, message, chalk })
  const stackA = gray(stack)
  return `${header}\n${stackA}`
}

// Add color, sign and `event.name` to first message line
const getHeader = function ({
  level,
  name,
  message,
  chalk,
  chalk: { italic, inverse, bold },
}) {
  const { message: messageA, details } = splitMessage({ message })

  const { COLOR, SIGN } = LEVELS[level]
  const prefix = ` ${SIGN}  ${name} ${italic(`(${messageA})`)} `
  const header = `${inverse(bold(prefix))}${details}`
  const headerA = chalk[COLOR](header)
  return headerA
}

const splitMessage = function ({ message }) {
  const [messageA, ...details] = message.split(':')
  const detailsA = details.join(':')
  return { message: messageA, details: detailsA }
}

// Each level is printed in a different way
const LEVELS = {
  debug: { COLOR: 'blue', SIGN: circleFilled },
  info: { COLOR: 'green', SIGN: info },
  warn: { COLOR: 'yellow', SIGN: warning },
  error: { COLOR: 'red', SIGN: cross },
}
