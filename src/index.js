import puppeteer from 'puppeteer'
import readline from 'readline'

import notify from './notify.js'
import sites from './sites/index.js'
import delay from '../utils/delay.js'

const INTERVAL_MIN = 5 // minutes
const INTERVAL_MS = INTERVAL_MIN * 60 * 1000 // milliseconds

const checkAllSites = async (browser) => {
  console.log('ℹ You can exit by hitting CTRL+C ...but it may take a moment.')
  
  try {
    const page = await browser.newPage()
    
    for (const {name, checker, url} of sites) {
      console.log(`🔍 Checking ${name}\n   at ${new Date()}...`)
      const result = await checker(page)

      if (result === true) {
        notify(name, url)
      } else if (result === false) {
        console.log(`⛔ ${name} has no appointments open yet.`)
      } else {
        console.log(`❓ ${name} appointment availability is unknown 🤔.`)
      }
    }

    await page.close()
    console.log(`⏳ Next round of checks will start in ${INTERVAL_MIN} minutes.`)
    return delay(checkAllSites, INTERVAL_MS, page) // here we go again
  } catch(err) {
    console.error('💥 error in checkAllSites:', err)
    process.exit()
  }
}

// Here's where the app begins 🚀
(async () => {
  console.log('🚦 Launching browser...')
  const browser = await puppeteer.launch({ headless: false }) // TODO: switch to headless after debugging

  // TODO: This still seems slightly buggy on Windows
  if (process.platform === 'win32') {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    })
    rl.on('SIGINT', () => process.emit('SIGINT'))
  }

  process.on('exit', async () => {
    console.log('🏁 Closing browser...')
    await browser.close()
    console.log('👋 All done! Bye bye!')
  });

  await checkAllSites(browser)
})();
