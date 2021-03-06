const fs = require('fs')
const { resolve } = require('path')
const args = require('minimist')(process.argv.slice(2))
const chalk = require('chalk')
const semver = require('semver')
const { prompt } = require('enquirer')
const execa = require('execa')

const pkg = getPackageJson()

const currentVersion = pkg.version
const scripts = pkg.scripts || {}

const preId = args.preid || (semver.prerelease(currentVersion) && semver.prerelease(currentVersion)[0])
const isPublish = args.publish

const versionIncrements = [
  'patch',
  'minor',
  'major',
  ...(preId ? ['prepatch', 'preminor', 'premajor', 'prerelease'] : [])
]

const inc = i => semver.inc(currentVersion, i, preId)
const run = (bin, args, opts = {}) => execa(bin, args, { stdio: 'inherit', ...opts })
const step = msg => console.log(chalk.cyan(msg))

async function main() {
  let targetVersion = args._[0]

  if (!targetVersion) {
    const { release } = await prompt({
      type: 'select',
      name: 'release',
      message: 'Select release type',
      choices: versionIncrements.map(i => `${i} (${inc(i)})`).concat(['custom'])
    })

    if (release === 'custom') {
      targetVersion = (
        await prompt({
          type: 'input',
          name: 'version',
          message: 'Input custom version',
          initial: currentVersion
        })
      ).version
    }
    else {
      targetVersion = release.match(/\((.*)\)/)[1]
    }
  }

  if (!semver.valid(targetVersion)) {
    throw new Error(`invalid target version: ${targetVersion}`)
  }

  const { yes } = await prompt({
    type: 'confirm',
    name: 'yes',
    message: `Releasing v${targetVersion}. Confirm?`
  })

  if (!yes) {
    return
  }

  const keys = Object.keys(scripts)

  step('\nUpdating package version...')
  pkg.version = targetVersion
  setPackageJson(pkg)

  // generate changelog
  step('\nGenerating changelog...')
  if (keys.includes('changelog')) {
    await run('pnpm', ['run', 'changelog'])
  }
  else {
    console.log('skipped')
  }

  // update pnpm-lock.yaml
  step('\nUpdating lockfile...')
  await run('pnpm', ['install', '--prefer-offline'])

  const { stdout } = await run('git', ['diff'], { stdio: 'pipe' })
  if (stdout) {
    step('\nCommitting changes...')
    await run('git', ['add', '-A'])
    await run('git', ['commit', '-m', `chore(release): v${targetVersion}`])
  }
  else {
    console.log('No changes to commit.')
  }

  // publish packages
  step('\nPublishing packages...')
  if (isPublish) {
    await publishPackage(targetVersion)
  }
  else {
    console.log('skipped')
  }

  // push to GitHub
  step('\nPushing to GitHub...')
  await run('git', ['tag', `v${targetVersion}`])
  await run('git', ['push', 'origin', `refs/tags/v${targetVersion}`])
  await run('git', ['push'])

  console.log(chalk.green('Finished.'))
}

async function publishPackage(version) {
  let releaseTag = null
  if (args.tag) {
    releaseTag = args.tag
  }
  else if (version.includes('alpha')) {
    releaseTag = 'alpha'
  }
  else if (version.includes('beta')) {
    releaseTag = 'beta'
  }
  else if (version.includes('rc')) {
    releaseTag = 'rc'
  }

  step('Publishing ...')
  try {
    await run(
      'yarn',
      [
        'publish',
        '--new-version',
        version,
        ...(releaseTag ? ['--tag', releaseTag] : []),
        '--access',
        'public'
      ],
      {
        stdio: 'pipe'
      }
    )
    console.log(chalk.green(`Successfully published ${pkg.name}@${version}`))
  }
  catch (e) {
    if (e.stderr.match(/previously published/)) {
      console.log(chalk.red(`Skipping already published: ${pkg.name}`))
    }
    else {
      throw e
    }
  }
}

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

main().catch((err) => {
  console.error(err)
})
