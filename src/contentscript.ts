import { parse } from 'node-html-parser'
import { Ticket } from './ticket'

export { TICKET_TYPE_ABBREVIATIONS, Ticket } from './ticket'

export function buildBranchNameFromHtml(html: string): string {
  const parsed = parse(html)
  const ticket = new Ticket(parsed)
  return ticket.buildBranchName()
}

export function isJiraDomain(url: string, domain: string): boolean {
  if (!domain) {
    return false
  }
  return url.includes(domain)
}
