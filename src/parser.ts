import { parse } from 'node-html-parser'

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
