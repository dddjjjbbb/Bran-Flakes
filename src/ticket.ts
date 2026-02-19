import { default as HTMLElement } from 'node-html-parser/dist/nodes/html'

export const TICKET_TYPE_ABBREVIATIONS: Record<string, string> = {
  'Tech Ticket': 'Tech',
  'Bug': 'Bug',
  'Task': 'Task',
  'Epic': 'Epic',
  'Feature Story': 'Feature',
  'Release Ticket': 'Release',
}

export class Ticket {
  private html: HTMLElement

  constructor(html: HTMLElement) {
    this.html = html
  }

  public buildBranchName(): string {
    const ticketType = this.getTicketType()
    const ticketNumber = this.getTicketNumber()
    const ticketName = this.getTicketName()

    const branchName = `${ticketType}/${ticketNumber}_${ticketName}`
    return this.cleanBranchName(branchName)
  }

  private abbreviateTicketType(ticketType: string): string {
    return TICKET_TYPE_ABBREVIATIONS[ticketType] || ticketType
  }

  private getTicketType(): string {
    const element = this.html.querySelector('#type-val')
    if (!element) {
      throw new Error('Could not find ticket type element (#type-val)')
    }
    const ticketTypeFromHtml = element.innerText.trim()
    return this.abbreviateTicketType(ticketTypeFromHtml).toLowerCase()
  }

  private getTicketNumber(): string {
    const element = this.html.querySelector('#key-val')
    if (!element) {
      throw new Error('Could not find ticket number element (#key-val)')
    }
    return element.innerText.toLowerCase()
  }

  private getTicketName(): string {
    const element = this.html.querySelector('#summary-val')
    if (!element) {
      throw new Error('Could not find ticket name element (#summary-val)')
    }
    return element.innerText.toLowerCase().replace(/\s/g, '-')
  }

  private cleanBranchName(branchName: string): string {
    return branchName
      .replace(/[():~^*?\[\]{}@#\\!'"`,;|<>&$%+= ]/g, '')
      .replace(/\.{2,}/g, '.')
      .replace(/\.lock($|\/)/g, '$1')
      .replace(/-{2,}/g, '-')
      .replace(/[-_]+$/, '')
  }
}
