import path from 'path'
import fs from 'fs'
import { exec } from 'child_process'
import minimist from 'minimist'

const argv = minimist(process.argv.slice(2))
const { path: pathToTypescript, endpoint } = argv
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

const rootDir = path.join(__dirname, '../../../')

// tmp contents going to be placed in git-ignored output directory
// (re)make the directory every time from scratch
const pathToTmpDir = path.join(rootDir, 'output')
if (fs.existsSync(pathToTmpDir)) {
  fs.rmSync(pathToTmpDir, { recursive: true })
}
fs.mkdirSync(pathToTmpDir)

;(async () => {
  // see package.json "dts-bundle-generator": "^8.0.1",
  // https://www.npmjs.com/package/dts-bundle-generator
  const pathToBundler = path.join(rootDir, 'node_modules/.bin/dts-bundle-generator') 
  
  try {
    // --project ${path.join(__dirname, '../../../tsconfig.json')}
    await promiseExec(`${pathToBundler}
    -o ${pathToTmpDir}/bundle.d.ts ${pathToTypescript}`.replace(/\s+/g, ' '))

    const contents = fs.readFileSync(`${pathToTmpDir}/bundle.d.ts`)
    console.log('we got contents!', contents.length)
    // completions portion 

  } catch(error) {
    console.error(error)
    process.exit(1)
  }
})()


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
