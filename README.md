# Bran Flakes

> Generate git branch names from Jira tickets.

Click the extension icon on any Jira issue page to get a formatted branch name like `bug/proj-123_fix-login-page`, then copy it to your clipboard.

## Install

```shell
npm install
npm run build
```

Then load the `dist/` directory as an unpacked extension in Chrome (`chrome://extensions` > "Load unpacked").

## Configuration

Open the extension's options page (right-click the icon > Options) and enter your Jira domain (e.g. `jira.mycompany.com`). The extension only activates on pages matching this domain.

## Development

```shell
npm start        # watch mode with hot reload
npm test         # run tests
npm run test:watch  # run tests in watch mode
```

## Branch name format

```
{ticketType}/{ticketNumber}_{ticketName}
```

Ticket types are abbreviated: `Tech Ticket` becomes `tech`, `Feature Story` becomes `feature`, `Release Ticket` becomes `release`. Others (`Bug`, `Task`, `Epic`) stay as-is. Parentheses and colons are stripped from the name.

## Licence

GPLv3
