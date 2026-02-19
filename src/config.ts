import { storageGet, storageSet } from './browser-api'

export const DEFAULT_DOMAIN = ''
const STORAGE_KEY = 'jiraDomain'

export function loadDomain(): Promise<string> {
  return storageGet(STORAGE_KEY).then((result) => {
    return result[STORAGE_KEY] || DEFAULT_DOMAIN
  })
}

export function saveDomain(domain: string): Promise<void> {
  return storageSet({ [STORAGE_KEY]: domain })
}
