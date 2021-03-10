import logger from '../utils/logger.js'

const NAME = 'CVS'
const URL = 'https://www.cvs.com/immunizations/covid-19-vaccine'
const AVAILABLE_STATUS = 'Available'

/*
 * param {Puppeteer Page} page
 * param {Object} search config with state abbreviation
 * returns Promise<Boolean | null> - appointment availability
*/
const checker = async (page, { state, cities }) => {
  await page.goto(URL)
  
  const stateLink = `a[data-modal='vaccineinfo-${state}']`
  const results = page.waitForResponse(`https://www.cvs.com/immunizations/covid-19-vaccine.vaccine-status.${state}.json?vaccineinfo`)
  const click = page.click(stateLink)
  const [finishedResults] = await Promise.all([results, click])
  let resultsJson = await finishedResults.json();
  let cityData = resultsJson['responsePayloadData'].data[`${state}`]
  let availableCities = cityData.filter((cityObj) => cities.includes(cityObj.city) && cityObj.status === AVAILABLE_STATUS);
  logger.log('Available Cities for CVS', availableCities);

  try {
    return availableCities.length > 0;
  } catch (err) {
    logger.error('CVS checker error:', err)
    return null // status unknown
  }
  
}

export default {
  name: NAME,
  checker,
  url: URL,
}
