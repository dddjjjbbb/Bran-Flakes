import { describe, it, expect, vi, afterEach } from 'vitest'
import { loadDomain, DEFAULT_DOMAIN } from './config'

describe('loadDomain', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns the default domain when chrome.storage is unavailable', async () => {
    vi.stubGlobal('chrome', undefined)
    const domain = await loadDomain()
    expect(domain).toBe(DEFAULT_DOMAIN)
  })

  it('returns the stored domain when chrome.storage has a value', async () => {
    vi.stubGlobal('chrome', {
      storage: {
        sync: {
          get(_key: string, callback: (result: any) => void) {
            callback({ jiraDomain: 'jira.mycompany.com' })
          },
        },
      },
    })
    const domain = await loadDomain()
    expect(domain).toBe('jira.mycompany.com')
  })

  it('falls back to default when storage returns empty', async () => {
    vi.stubGlobal('chrome', {
      storage: {
        sync: {
          get(_key: string, callback: (result: any) => void) {
            callback({})
          },
        },
      },
    })
    const domain = await loadDomain()
    expect(domain).toBe(DEFAULT_DOMAIN)
  })
})
