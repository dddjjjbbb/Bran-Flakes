import { parse } from "node-html-parser";
import _ from "lodash";
import "regenerator-runtime/runtime";

class Parser {
  window: Window;

  constructor(window: Window) {
    this.window = window;
  }

  parseHtml() {
    const html = this._getHtmlForActiveTab();
    return parse(html);
  }

  _getHtmlForActiveTab(): string {
    return this.window.document.documentElement.outerHTML;
  }
}

enum TicketType {
  Tech = "Tech Ticket" as any,
  Bug = "Bug" as any,
  Task = "Task" as any,
  Epic = "Epic" as any,
  Feature = "Feature Story" as any,
  Release = "Release Ticket" as any,
}

class Ticket {
  html: any;

  constructor(html: any) {
    this.html = html;
  }

  async buildBranchName(): Promise<string> {
    const ticketType = await this._getTicketType();
    const ticketNumber = await this._getTicketNumber();
    const ticketName = await this._getTicketName();

    const branchName = `${ticketType}/${ticketNumber}_${ticketName}`;

    const finalBranchName = await this._cleanBranchName(branchName);

    return finalBranchName;
  }

  async _getabbreviated_ticket_name(
    ticketType: string
  ): Promise<string | undefined> {
    let enumKey = TicketType[ticketType];

    if (enumKey !== "undefined") {
      return enumKey;
    }
    return ticketType;
  }

  async _getTicketType(): Promise<string | undefined> {
    const ticketTypeFromHtml = this.html
      .querySelector(`#type-val`)
      .innerText.trim();
    const result = await this._getabbreviated_ticket_name(ticketTypeFromHtml);
    if (!result) {
      return undefined;
    }
    return result.toLowerCase();
  }

  async _getTicketNumber(): Promise<string> {
    return this.html.querySelector(`#key-val`).innerText.toLowerCase();
  }

  async _getTicketName(): Promise<string> {
    const ticketName = this.html
      .querySelector(`#summary-val`)
      .innerText.toLowerCase()
      .replace(/\s/g, "-");
    return ticketName;
  }

  async _cleanBranchName(branchName: string): Promise<string> {
    return branchName.replace(/[():]/g, "");
  }

  // async _convertCamelCaseToStartCase(ticketName: string): Promise<string> {
  //   return _.startCase(ticketName);
  // }
}

// TODO add functionality to handle camelCase Strings `UnhandledPromiseRejectionWarning`

export async function main(domainName: string) {
  if (window.location.href.includes(domainName)) {
    const parser = new Parser(window);
    const html = parser.parseHtml();
    const ticketService = new Ticket(html);
    const branchName = await ticketService.buildBranchName();
    return branchName;
  }
  return "Could not generate branch name";
}

const DOMAIN_NAME = "jira.sharethemeal.org";
main(DOMAIN_NAME).then((result) => alert(result));
