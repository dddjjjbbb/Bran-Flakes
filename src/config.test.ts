import { describe, it, expect, vi } from 'vitest'
import { loadDomain, DEFAULT_DOMAIN } from './config'

vi.mock('./browser-api', () => ({
  storageGet: vi.fn(),
  storageSet: vi.fn(),
}))

import { storageGet } from './browser-api'

describe('loadDomain', () => {
  it('returns the stored domain when storage has a value', async () => {
    vi.mocked(storageGet).mockResolvedValue({ jiraDomain: 'jira.mycompany.com' })
    const domain = await loadDomain()
    expect(domain).toBe('jira.mycompany.com')
  })

  it('falls back to default when storage returns empty', async () => {
    vi.mocked(storageGet).mockResolvedValue({})
    const domain = await loadDomain()
    expect(domain).toBe(DEFAULT_DOMAIN)
  })

  it('falls back to default when storage returns no matching key', async () => {
    vi.mocked(storageGet).mockResolvedValue({ otherKey: 'value' })
    const domain = await loadDomain()
    expect(domain).toBe(DEFAULT_DOMAIN)
  })
})
