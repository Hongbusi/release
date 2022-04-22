const fs = require('fs')
const { resolve } = require('path')
const chalk = require('chalk')

function getPackageJson(cwd = process.cwd()) {
  const path = resolve(cwd, 'package.json')

  if (fs.existsSync(path)) {
    try {
      const raw = fs.readFileSync(path, 'utf-8')
      const data = JSON.parse(raw)
      return data
    }
    catch (e) {
      console.log(chalk.red('Failed to parse package.json.'))
      process.exit(0)
    }
  }
}

function setPackageJson(data, cwd = process.cwd()) {
  const path = resolve(cwd, 'package.json')

  if (fs.existsSync(path)) {
    try {
      fs.writeFileSync(path, JSON.stringify(data, null, 2))
    }
    catch (e) {
      console.log(chalk.red('Failed to parse package.json.'))
      process.exit(0)
    }
  }
}

module.exports = {
  getPackageJson,
  setPackageJson
}
