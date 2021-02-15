import createPageEvaluator from '../../utils/createPageEvaluator.js'

const URL = 'https://www.cvs.com/immunizations/covid-19-vaccine'

/*
 * Sends a GET request and parses the JSON response
 * returns Promise<Boolean> - appointment availability
*/
const checker = async () => {
  const STATE = 'MD'
  const FETCH_URL = `https://www.cvs.com/immunizations/covid-19-vaccine.vaccine-status.${STATE}.json?vaccineinfo`
  const FETCH_CONFIG = {
    'credentials': 'include',
    'headers': {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:85.0) Gecko/20100101 Firefox/85.0',
      'Accept': '*/*',
      'Accept-Language': 'en-US,en;q=0.5',
      'Pragma': 'no-cache',
      'Cache-Control': 'no-cache'
    },
    'referrer': 'https://www.cvs.com/immunizations/covid-19-vaccine',
    'method': 'GET',
    'mode': 'cors'
  }
  
  // `window` reference means this must be run within context of Puppeteer page
  return await window.fetch(FETCH_URL, FETCH_CONFIG)
    .then(res => res.json())
    .then(json => {
      const cities = json.responsePayloadData.data[STATE]
      return cities.some(city => city.status !== 'Fully Booked')
    })
}

export default {
  name: 'CVS',
  checker: createPageEvaluator(URL, checker),
  url: URL,
}