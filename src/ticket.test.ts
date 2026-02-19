import { describe, it, expect } from 'vitest'
import { parse } from 'node-html-parser'
import { TICKET_TYPE_ABBREVIATIONS, Ticket } from './ticket'

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
  return new Ticket(parse(buildJiraHtml(ticketType, ticketNumber, summary)))
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

describe('Ticket.buildBranchName', () => {
  it('builds a branch name from a Bug ticket', () => {
    const ticket = makeTicket('Bug', 'PROJ-123', 'Fix Login Page')
    expect(ticket.buildBranchName()).toBe('bug/proj-123_fix-login-page')
  })

  it('builds a branch name for a Tech Ticket', () => {
    const ticket = makeTicket('Tech Ticket', 'PROJ-456', 'Upgrade Dependencies')
    expect(ticket.buildBranchName()).toBe('tech/proj-456_upgrade-dependencies')
  })

  it('builds a branch name for a Feature Story', () => {
    const ticket = makeTicket('Feature Story', 'PROJ-789', 'Add User Dashboard')
    expect(ticket.buildBranchName()).toBe('feature/proj-789_add-user-dashboard')
  })

  it('builds a branch name for a Task', () => {
    const ticket = makeTicket('Task', 'PROJ-1', 'Update Config')
    expect(ticket.buildBranchName()).toBe('task/proj-1_update-config')
  })

  it('builds a branch name for an Epic', () => {
    const ticket = makeTicket('Epic', 'PROJ-1', 'Redesign')
    expect(ticket.buildBranchName()).toBe('epic/proj-1_redesign')
  })

  it('builds a branch name for a Release Ticket', () => {
    const ticket = makeTicket('Release Ticket', 'PROJ-1', 'Version Two')
    expect(ticket.buildBranchName()).toBe('release/proj-1_version-two')
  })

  it('lowercases the ticket number', () => {
    const ticket = makeTicket('Bug', 'PROJ-123', 'Summary')
    expect(ticket.buildBranchName()).toBe('bug/proj-123_summary')
  })

  it('replaces whitespace with hyphens in the summary', () => {
    const ticket = makeTicket('Bug', 'PROJ-1', 'Fix Multiple Spaces')
    expect(ticket.buildBranchName()).toBe('bug/proj-1_fix-multiple-spaces')
  })

  it('strips parentheses from the branch name', () => {
    const ticket = makeTicket('Bug', 'PROJ-1', 'Fix (urgent) bug')
    expect(ticket.buildBranchName()).toBe('bug/proj-1_fix-urgent-bug')
  })

  it('strips colons from the branch name', () => {
    const ticket = makeTicket('Bug', 'PROJ-1', 'Fix: thing')
    expect(ticket.buildBranchName()).toBe('bug/proj-1_fix-thing')
  })

  it('strips multiple special characters from the branch name', () => {
    const ticket = makeTicket('Bug', 'PROJ-1', 'Fix (critical): login issue')
    expect(ticket.buildBranchName()).toBe('bug/proj-1_fix-critical-login-issue')
  })

  it('strips trailing hyphens from the branch name', () => {
    const ticket = makeTicket('Bug', 'BE-4378', 'Observability fix routes without targets ')
    expect(ticket.buildBranchName()).toBe('bug/be-4378_observability-fix-routes-without-targets')
  })

  it('strips trailing underscores from the branch name', () => {
    const ticket = makeTicket('Bug', 'PROJ-1', 'Trailing underscore_ ')
    expect(ticket.buildBranchName()).toBe('bug/proj-1_trailing-underscore')
  })

  it('strips square brackets from the branch name', () => {
    const ticket = makeTicket('Bug', 'PROJ-1', 'Fix [WIP] thing')
    expect(ticket.buildBranchName()).toBe('bug/proj-1_fix-wip-thing')
  })

  it('strips curly braces and other git-invalid characters', () => {
    const ticket = makeTicket('Bug', 'PROJ-1', 'Fix ~thing^ with *special? chars')
    expect(ticket.buildBranchName()).toBe('bug/proj-1_fix-thing-with-special-chars')
  })

  it('collapses consecutive hyphens into one', () => {
    const ticket = makeTicket('Bug', 'PROJ-1', 'Fix: : thing')
    expect(ticket.buildBranchName()).toBe('bug/proj-1_fix-thing')
  })

  it('uses the raw type name when no abbreviation exists', () => {
    const ticket = makeTicket('Spike', 'PROJ-1', 'Research')
    expect(ticket.buildBranchName()).toBe('spike/proj-1_research')
  })

  it('throws when ticket type element is missing', () => {
    const html = parse('<html><body><a id="key-val">PROJ-1</a><h1 id="summary-val">S</h1></body></html>')
    const ticket = new Ticket(html)
    expect(() => ticket.buildBranchName()).toThrow('Could not find ticket type element')
  })

  it('throws when ticket number element is missing', () => {
    const html = parse('<html><body><span id="type-val">Bug</span><h1 id="summary-val">S</h1></body></html>')
    const ticket = new Ticket(html)
    expect(() => ticket.buildBranchName()).toThrow('Could not find ticket number element')
  })

  it('throws when summary element is missing', () => {
    const html = parse('<html><body><span id="type-val">Bug</span><a id="key-val">PROJ-1</a></body></html>')
    const ticket = new Ticket(html)
    expect(() => ticket.buildBranchName()).toThrow('Could not find ticket name element')
  })
})
