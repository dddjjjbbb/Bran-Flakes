# Bran Flakes

<p align="center">
  <img src="static/images/icon128.png" alt="Bran Flakes logo" width="128" />
</p>

> Generate git branch names from Jira tickets.

Generating branch names can be an additional pain in the neck; let Bran Flakes do it for you. Just click the icon on any Jira issue page to get a nicely formatted branch name that future you will thank you for.

## Features

- Generates branch names from Jira ticket type, number, and summary
- Editable (click the pencil icon to tweak before copying)
- One-click copy to clipboard
- Auto-detects your Jira domain on first use
- Sane error messaging
- Works in both Chrome and Firefox

## Install

```shell
npm install
npm run build
```

### Chrome

1. Open `chrome://extensions`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Select the `dist/` directory

### Firefox

1. Open `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Select any file inside the `dist/` directory (e.g. `dist/manifest.json`)

## Configuration

Open the extension's options page and enter your Jira domain (e.g. `jira.plutocracy.com`). The extension only activates on pages matching your domain.

If no domain is configured, the extension will offer to use the current page's domain when you first click it on it, provided you're on a Jira page.

## Development

```shell
npm start          # watch mode with hot reload
npm test           # run tests
npm run test:watch # run tests in watch mode
```

Husky runs tslint and vitest on staged files before each commit.

## Branch name format

```
{ticketType}/{ticketNumber}_{ticketName}
```

Ticket types are abbreviated: `Tech Ticket` becomes `tech`, `Feature Story` becomes `feature`, `Release Ticket` becomes `release`. Others (`Bug`, `Task`, `Epic`) stay as-is.

Special characters (parentheses, colons, brackets, and other git-invalid characters) are stripped. Trailing hyphens and underscores are removed. Consecutive hyphens are collapsed.

## Licence

[GPLv3](LICENSE)
