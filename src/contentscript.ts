import { loadDomain } from './config'
import { Parser } from './parser'
import { Ticket } from './ticket'

export { TICKET_TYPE_ABBREVIATIONS, Ticket } from './ticket'
export { Parser } from './parser'

export async function main(domainName: string) {
  if (window.location.href.includes(domainName)) {
    const parser = new Parser(window)
    const html = parser.parseHtml()
    const ticket = new Ticket(html)
    return ticket.buildBranchName()
  }
  return 'Could not generate branch name'
}

if (typeof window !== 'undefined') {
  loadDomain().then((domain) => main(domain)).then((result) => alert(result))
}
