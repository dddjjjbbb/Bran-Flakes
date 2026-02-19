import { afterEach, describe, it, expect, vi } from 'vitest'
import { main } from './contentscript'

describe('main', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  function stubWindow(url: string, bodyHtml: string) {
    vi.stubGlobal('window', {
      location: { href: url },
      document: {
        documentElement: {
          outerHTML: `<html><body>${bodyHtml}</body></html>`,
        },
      },
    })
  }

  it('returns a branch name when the domain matches', async () => {
    stubWindow(
      'https://jira.example.com/browse/PROJ-42',
      `<span id="type-val">Bug</span>
       <a id="key-val">PROJ-42</a>
       <h1 id="summary-val">Fix Login</h1>`,
    )
    const result = await main('jira.example.com')
    expect(result).toBe('bug/proj-42_fix-login')
  })

  it('returns error message when domain does not match', async () => {
    stubWindow('https://other-site.com/page', '')
    const result = await main('jira.example.com')
    expect(result).toBe('Could not generate branch name')
  })

  it('returns error message when domain is empty', async () => {
    stubWindow('https://any-site.com/page', '')
    const result = await main('')
    expect(result).toBe('Could not generate branch name')
  })
})
