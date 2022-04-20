function logger() {
  const colors = {
    red: '\x1b[91m',
    cyan: '\x1b[36m',
    green: '\x1b[32m'
  }

  function log(color: 'red' | 'cyan' | 'green') {
    const colorCode = colors[color] || ''

    return (message: string) => {
    // eslint-disable-next-line no-console
      console.log(colorCode, message)
    }
  }

  return {
    red: log('red'),
    cyan: log('cyan'),
    green: log('green')
  }
}

export const log = logger()
