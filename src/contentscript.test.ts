import { afterEach, describe, it, expect, vi } from 'vitest'
import { parse } from 'node-html-parser'
import { TICKET_TYPE_ABBREVIATIONS, Ticket, main } from './contentscript'

function buildJiraHtml(ticketType: string, ticketNumber: string, summary: string): string {
  return `
    <html>
      <body>
        <span id="type-val">${ticketType}</span>
        <a id="key-val">${ticketNumber}</a>
        <h1 id="summary-val">${summary}</h1>
      </body>
    </html>
  `
}

function makeTicket(ticketType: string, ticketNumber: string, summary: string): Ticket {
  const html = parse(buildJiraHtml(ticketType, ticketNumber, summary))
  return new Ticket(html)
}

describe('TICKET_TYPE_ABBREVIATIONS', () => {
  it('maps Tech Ticket to Tech', () => {
    expect(TICKET_TYPE_ABBREVIATIONS['Tech Ticket']).toBe('Tech')
  })

  it('maps Bug to Bug', () => {
    expect(TICKET_TYPE_ABBREVIATIONS.Bug).toBe('Bug')
  })

  it('maps Task to Task', () => {
    expect(TICKET_TYPE_ABBREVIATIONS.Task).toBe('Task')
  })

  it('maps Epic to Epic', () => {
    expect(TICKET_TYPE_ABBREVIATIONS.Epic).toBe('Epic')
  })

  it('maps Feature Story to Feature', () => {
    expect(TICKET_TYPE_ABBREVIATIONS['Feature Story']).toBe('Feature')
  })

  it('maps Release Ticket to Release', () => {
    expect(TICKET_TYPE_ABBREVIATIONS['Release Ticket']).toBe('Release')
  })

  it('returns undefined for unknown ticket types', () => {
    // tslint:disable-next-line:no-string-literal
    expect(TICKET_TYPE_ABBREVIATIONS['Unknown']).toBeUndefined()
  })
})

describe('Ticket._cleanBranchName', () => {
  const ticket = makeTicket('Bug', 'PROJ-1', 'placeholder')

  it('removes parentheses from branch name', async () => {
    expect(await ticket._cleanBranchName('bug/proj-1_fix-(urgent)')).toBe('bug/proj-1_fix-urgent')
  })

  it('removes colons from branch name', async () => {
    expect(await ticket._cleanBranchName('bug/proj-1_fix:-thing')).toBe('bug/proj-1_fix-thing')
  })

  it('removes multiple special characters', async () => {
    expect(await ticket._cleanBranchName('bug/proj-1_fix:(a):(b)')).toBe('bug/proj-1_fixab')
  })

  it('leaves clean names unchanged', async () => {
    expect(await ticket._cleanBranchName('bug/proj-1_fix-thing')).toBe('bug/proj-1_fix-thing')
  })
})

describe('Ticket._getTicketNumber', () => {
  it('returns the ticket number in lowercase', async () => {
    const ticket = makeTicket('Bug', 'PROJ-123', 'Some Summary')
    expect(await ticket._getTicketNumber()).toBe('proj-123')
  })
})

describe('Ticket._getTicketName', () => {
  it('converts summary to lowercase with hyphens', async () => {
    const ticket = makeTicket('Bug', 'PROJ-1', 'Fix Login Page')
    expect(await ticket._getTicketName()).toBe('fix-login-page')
  })

  it('replaces all whitespace with hyphens', async () => {
    const ticket = makeTicket('Bug', 'PROJ-1', 'Fix  Multiple   Spaces')
    expect(await ticket._getTicketName()).toBe('fix--multiple---spaces')
  })
})

describe('Ticket._getTicketType', () => {
  it('returns abbreviated type for Tech Ticket', async () => {
    const ticket = makeTicket('Tech Ticket', 'PROJ-1', 'summary')
    expect(await ticket._getTicketType()).toBe('tech')
  })

  it('returns bug for Bug', async () => {
    const ticket = makeTicket('Bug', 'PROJ-1', 'summary')
    expect(await ticket._getTicketType()).toBe('bug')
  })

  it('returns task for Task', async () => {
    const ticket = makeTicket('Task', 'PROJ-1', 'summary')
    expect(await ticket._getTicketType()).toBe('task')
  })

  it('returns epic for Epic', async () => {
    const ticket = makeTicket('Epic', 'PROJ-1', 'summary')
    expect(await ticket._getTicketType()).toBe('epic')
  })

  it('returns feature for Feature Story', async () => {
    const ticket = makeTicket('Feature Story', 'PROJ-1', 'summary')
    expect(await ticket._getTicketType()).toBe('feature')
  })

  it('returns release for Release Ticket', async () => {
    const ticket = makeTicket('Release Ticket', 'PROJ-1', 'summary')
    expect(await ticket._getTicketType()).toBe('release')
  })
})

describe('Ticket.buildBranchName', () => {
  it('builds a complete branch name from a Bug ticket', async () => {
    const ticket = makeTicket('Bug', 'PROJ-123', 'Fix Login Page')
    expect(await ticket.buildBranchName()).toBe('bug/proj-123_fix-login-page')
  })

  it('builds a branch name for a Tech Ticket', async () => {
    const ticket = makeTicket('Tech Ticket', 'PROJ-456', 'Upgrade Dependencies')
    expect(await ticket.buildBranchName()).toBe('tech/proj-456_upgrade-dependencies')
  })

  it('builds a branch name for a Feature Story', async () => {
    const ticket = makeTicket('Feature Story', 'PROJ-789', 'Add User Dashboard')
    expect(await ticket.buildBranchName()).toBe('feature/proj-789_add-user-dashboard')
  })

  it('strips parentheses and colons from the final name', async () => {
    const ticket = makeTicket('Bug', 'PROJ-1', 'Fix (critical): login issue')
    expect(await ticket.buildBranchName()).toBe('bug/proj-1_fix-critical-login-issue')
  })
})

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
      'https://jira.sharethemeal.org/browse/PROJ-42',
      `<span id="type-val">Bug</span>
       <a id="key-val">PROJ-42</a>
       <h1 id="summary-val">Fix Login</h1>`,
    )
    const result = await main('jira.sharethemeal.org')
    expect(result).toBe('bug/proj-42_fix-login')
  })

  it('returns error message when domain does not match', async () => {
    stubWindow('https://other-site.com/page', '')
    const result = await main('jira.sharethemeal.org')
    expect(result).toBe('Could not generate branch name')
  })
})
