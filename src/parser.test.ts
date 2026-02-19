import { describe, it, expect } from 'vitest'
import { Parser } from './parser'

function fakeWindow(outerHTML: string): Window {
  return {
    document: {
      documentElement: { outerHTML },
    },
  } as any
}

describe('Parser', () => {
  describe('_getHtmlForActiveTab', () => {
    it('returns the outerHTML from the window document', () => {
      const html = '<html><body><p>hello</p></body></html>'
      const parser = new Parser(fakeWindow(html))
      expect(parser._getHtmlForActiveTab()).toBe(html)
    })
  })

  describe('parseHtml', () => {
    it('returns a parsed HTML node from the active tab', () => {
      const parser = new Parser(fakeWindow('<html><body><div id="test">content</div></body></html>'))
      const result = parser.parseHtml()
      expect(result.querySelector('#test')).not.toBeNull()
      expect(result.querySelector('#test')!.innerText).toBe('content')
    })

    it('handles HTML with Jira-like structure', () => {
      const jiraHtml = `<html><body>
        <span id="type-val">Bug</span>
        <a id="key-val">PROJ-99</a>
        <h1 id="summary-val">Test Summary</h1>
      </body></html>`
      const parser = new Parser(fakeWindow(jiraHtml))
      const result = parser.parseHtml()
      expect(result.querySelector('#type-val')!.innerText).toBe('Bug')
      expect(result.querySelector('#key-val')!.innerText).toBe('PROJ-99')
      expect(result.querySelector('#summary-val')!.innerText).toBe('Test Summary')
    })
  })
})
