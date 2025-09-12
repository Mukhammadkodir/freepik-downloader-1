import { getSavedCookie, setCookie, saveCookie } from './cookie/cookie'
import { downloadByUrl as downloadByUrlV2 } from './downloader/auto-downloader'
import { getDownloadLink, close } from './downloader/link-extractor'

export default {
  setCookie,
  saveCookie,
  getSavedCookie,
  downloadByUrlV2,
  getDownloadLink,
  close
}