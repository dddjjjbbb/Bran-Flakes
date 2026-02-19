import { describe, it, expect } from 'vitest'
import { buildBranchNameFromHtml, isJiraDomain } from './contentscript'

function jiraHtml(type: string, key: string, summary: string): string {
  return `<html><body>
    <span id="type-val">${type}</span>
    <a id="key-val">${key}</a>
    <h1 id="summary-val">${summary}</h1>
  </body></html>`
}

describe('buildBranchNameFromHtml', () => {
  it('returns a branch name from valid Jira HTML', () => {
    const html = jiraHtml('Bug', 'PROJ-42', 'Fix Login')
    expect(buildBranchNameFromHtml(html)).toBe('bug/proj-42_fix-login')
  })

  it('throws when required elements are missing', () => {
    expect(() => buildBranchNameFromHtml('<html><body></body></html>')).toThrow()
  })
})

describe('isJiraDomain', () => {
  it('returns true when URL contains the domain', () => {
    expect(isJiraDomain('https://jira.example.com/browse/PROJ-1', 'jira.example.com')).toBe(true)
  })

  it('returns false when URL does not contain the domain', () => {
    expect(isJiraDomain('https://other-site.com/page', 'jira.example.com')).toBe(false)
  })

  it('returns false when domain is empty', () => {
    expect(isJiraDomain('https://any-site.com/page', '')).toBe(false)
  })
})
