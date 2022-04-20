import minimist from 'minimist'
import chalk from 'chalk'

const args = minimist(process.argv.slice(2))

console.log(args)
console.log(chalk.blue('Hello world!'))
