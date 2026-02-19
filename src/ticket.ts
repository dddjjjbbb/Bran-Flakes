export const TICKET_TYPE_ABBREVIATIONS: Record<string, string> = {
  'Tech Ticket': 'Tech',
  'Bug': 'Bug',
  'Task': 'Task',
  'Epic': 'Epic',
  'Feature Story': 'Feature',
  'Release Ticket': 'Release',
}

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
    return this._cleanBranchName(branchName)
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
    return this.html
      .querySelector(`#summary-val`)
      .innerText.toLowerCase()
      .replace(/\s/g, '-')
  }

  public async _cleanBranchName(branchName: string): Promise<string> {
    return branchName.replace(/[():]/g, '')
  }
}
