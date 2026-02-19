import { parse } from 'node-html-parser'
import { loadDomain } from './config'

export class Parser {
  public window: Window

  constructor(window: Window) {
    this.window = window
  }

  public parseHtml() {
    const html = this._getHtmlForActiveTab()
    return parse(html)
  }

  public _getHtmlForActiveTab(): string {
    return this.window.document.documentElement.outerHTML
  }
}

export const TICKET_TYPE_ABBREVIATIONS: Record<string, string> = {
  'Tech Ticket': 'Tech',
  'Bug': 'Bug',
  'Task': 'Task',
  'Epic': 'Epic',
  'Feature Story': 'Feature',
  'Release Ticket': 'Release',
}

// tslint:disable-next-line:max-classes-per-file
export class Ticket {
  public html: any

  constructor(html: any) {
    this.html = html
  }

  public async buildBranchName(): Promise<string> {
    const ticketType = await this._getTicketType()
    const ticketNumber = await this._getTicketNumber()
    const ticketName = await this._getTicketName()

    const branchName = `${ticketType}/${ticketNumber}_${ticketName}`

    const finalBranchName = await this._cleanBranchName(branchName)

    return finalBranchName
  }

  public async _getabbreviated_ticket_name(
    ticketType: string,
  ): Promise<string> {
    return TICKET_TYPE_ABBREVIATIONS[ticketType] || ticketType
  }

  public async _getTicketType(): Promise<string | undefined> {
    const ticketTypeFromHtml = this.html
      .querySelector(`#type-val`)
      .innerText.trim()
    const result = await this._getabbreviated_ticket_name(ticketTypeFromHtml)
    if (!result) {
      return undefined
    }
    return result.toLowerCase()
  }

  public async _getTicketNumber(): Promise<string> {
    return this.html.querySelector(`#key-val`).innerText.toLowerCase()
  }

  public async _getTicketName(): Promise<string> {
    const ticketName = this.html
      .querySelector(`#summary-val`)
      .innerText.toLowerCase()
      .replace(/\s/g, '-')
    return ticketName
  }

  public async _cleanBranchName(branchName: string): Promise<string> {
    return branchName.replace(/[():]/g, '')
  }
}

export async function main(domainName: string) {
  if (window.location.href.includes(domainName)) {
    const parser = new Parser(window)
    const html = parser.parseHtml()
    const ticketService = new Ticket(html)
    const branchName = await ticketService.buildBranchName()
    return branchName
  }
  return 'Could not generate branch name'
}

if (typeof window !== 'undefined') {
  loadDomain().then((domain) => main(domain)).then((result) => alert(result))
}
