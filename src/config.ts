export const DEFAULT_DOMAIN = ''
const STORAGE_KEY = 'jiraDomain'

export function loadDomain(): Promise<string> {
  return new Promise((resolve) => {
    if (typeof chrome === 'undefined' || !chrome.storage) {
      resolve(DEFAULT_DOMAIN)
      return
    }

    chrome.storage.sync.get(STORAGE_KEY, (result) => {
      resolve(result[STORAGE_KEY] || DEFAULT_DOMAIN)
    })
  })
}

export function saveDomain(domain: string): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.sync.set({ [STORAGE_KEY]: domain }, resolve)
  })
}
