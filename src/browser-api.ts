// Cross-browser API helper.
// Firefox uses `browser.*` (promise-based).
// Chrome uses `chrome.*` (callback-based).
// This module normalises both to promises.

declare const browser: any

function getBrowserApi(): any {
  if (typeof browser !== 'undefined') {
    return browser
  }
  if (typeof chrome !== 'undefined') {
    return chrome
  }
  return undefined
}

export function storageGet(key: string): Promise<any> {
  const api = getBrowserApi()
  if (!api || !api.storage) {
    return Promise.resolve({})
  }

  const result = api.storage.local.get(key)
  if (result && typeof result.then === 'function') {
    return result
  }

  return new Promise((resolve) => {
    api.storage.local.get(key, resolve)
  })
}

export function storageSet(items: Record<string, any>): Promise<void> {
  const api = getBrowserApi()
  if (!api || !api.storage) {
    return Promise.resolve()
  }

  const result = api.storage.local.set(items)
  if (result && typeof result.then === 'function') {
    return result
  }

  return new Promise((resolve) => {
    api.storage.local.set(items, resolve)
  })
}

export function queryActiveTabs(): Promise<any[]> {
  const api = getBrowserApi()
  if (!api || !api.tabs) {
    return Promise.resolve([])
  }

  const result = api.tabs.query({ active: true, currentWindow: true })
  if (result && typeof result.then === 'function') {
    return result
  }

  return new Promise((resolve) => {
    api.tabs.query({ active: true, currentWindow: true }, resolve)
  })
}

export function executeScript(tabId: number, func: () => any): Promise<any[]> {
  const api = getBrowserApi()
  if (!api || !api.scripting) {
    return Promise.resolve([])
  }

  try {
    const result = api.scripting.executeScript({
      target: { tabId },
      func,
    })
    if (result && typeof result.then === 'function') {
      return result
    }

    return new Promise((resolve) => {
      api.scripting.executeScript(
        { target: { tabId }, func },
        resolve,
      )
    })
  } catch (e) {
    return Promise.reject(e)
  }
}

export function copyToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text).then(() => true, () => false)
  }

  // Fallback for environments where Clipboard API is unavailable
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.select()
  const success = document.execCommand('copy')
  document.body.removeChild(textarea)
  return Promise.resolve(success)
}
