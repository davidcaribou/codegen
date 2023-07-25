import path from 'path'
import fs from 'fs'
import { exec } from 'child_process'
import minimist from 'minimist'
import { getMockDataCompletion } from '../../shared'
import { getRouteCode } from './template'

const argv = minimist(process.argv.slice(2))
const { 
  path: pathToTypescript,
  endpoint,
  interfaceName,
} = argv

if (!pathToTypescript) {
  console.error('missing path flag.  try adding "--path ${path}"')
  process.exit(1)
}
if (!fs.existsSync(pathToTypescript)) {
  console.error('provided path does not exist in fs:', pathToTypescript)
  process.exit(1)
}
if (!endpoint) {
  console.error('missing endpoint flag.  try adding "--endpoint ${endpoint}"')
  process.exit(1)
}
if (!interfaceName) {
  console.error('missing interface name.')
  process.exit(1)
}

const rootDir = path.join(__dirname, '../../../')

// tmp contents going to be placed in git-ignored output directory
// (re)make the directory every time from scratch
const pathToOutputDir = path.join(rootDir, 'output')
if (fs.existsSync(pathToOutputDir)) {
  fs.rmSync(pathToOutputDir, { recursive: true })
}
fs.mkdirSync(pathToOutputDir)

;(async () => {
  // see package.json "dts-bundle-generator": "^8.0.1",
  // https://www.npmjs.com/package/dts-bundle-generator
  const pathToBundler = path.join(rootDir, 'node_modules/.bin/dts-bundle-generator') 
  
  try {
    // --project ${path.join(rootDir, 'tsconfig.json')}
    await promiseExec(`${pathToBundler}
    -o ${pathToOutputDir}/bundle.d.ts ${pathToTypescript}`.replace(/\s+/g, ' '))

    const contents = fs.readFileSync(`${pathToOutputDir}/bundle.d.ts`)

    // completions
    const maybeTypescriptCode = await getMockDataCompletion(
      interfaceName,
      String(contents)
    )
    if (typeof maybeTypescriptCode === 'string') {
      outputCode({
        code: maybeTypescriptCode,
        endpoint,
        interfaceName,
        outputDir: pathToOutputDir
      })
    }
  } catch(error) {
    console.error(error)
    process.exit(1)
  }
})()

function outputCode({
  code,
  interfaceName,
  endpoint,
  outputDir,
}:{
  code: string
  interfaceName: string
  endpoint: string
  outputDir: string
}) {
  fs.writeFileSync(
    path.join(outputDir, 'route.ts'),
    getRouteCode(interfaceName, code)
  )
  fs.writeFileSync(
    path.join(outputDir, `hook.ts`),
    getRouteCode(interfaceName, endpoint)
  )
}

function promiseExec(cmd: string) {
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        reject(`error running bundler: ${stderr}`)
      }
      if (stderr) {
        console.warn(stderr)
        resolve(stdout)
      }
      resolve(stdout)
    })
  })
}