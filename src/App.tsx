import React, { useState, useEffect } from 'react'
import { buildBranchNameFromHtml, isJiraDomain } from './contentscript'
import { loadDomain, saveDomain } from './config'
import { queryActiveTabs, executeScript, copyToClipboard } from './browser-api'

const ERROR_MESSAGE = 'Could not generate branch name'
const PARSE_ERROR_MESSAGE = 'Could not parse ticket. Make sure you are viewing an Issue.'
const WRONG_PAGE_MESSAGE = 'Navigate to a Jira ticket page to generate a branch name'
const LOADING_MESSAGE = 'Loading...'
const TIMEOUT_MS = 5000

function extractDomain(url: string): string {
  try {
    const a = document.createElement('a')
    a.href = url
    return a.hostname
  } catch (e) {
    return ''
  }
}

function looksLikeJira(url: string): boolean {
  const lower = url.toLowerCase()
  return lower.includes('jira') || lower.includes('/browse/') || lower.includes('/projects/')
}

function App() {
  const [gitBranchName, setGitBranchName] = useState(LOADING_MESSAGE)
  const [copyStatus, setCopyStatus] = useState('')
  const [copied, setCopied] = useState(false)
  const [suggestedDomain, setSuggestedDomain] = useState('')
  const [hasBranchName, setHasBranchName] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isError, setIsError] = useState(false)
  const [configuredDomain, setConfiguredDomain] = useState('')

  useEffect(() => {
    let settled = false

    const timeout = setTimeout(() => {
      if (!settled) {
        settled = true
        setGitBranchName(ERROR_MESSAGE)
        setIsError(true)
      }
    }, TIMEOUT_MS)

    loadDomain()
      .then((domain) => {
        if (!domain) {
          return queryActiveTabs().then((tabs) => {
            const tab = tabs && tabs[0]
            const url = (tab && tab.url) ? tab.url : ''
            const detected = extractDomain(url)
            if (detected && looksLikeJira(url)) {
              setSuggestedDomain(detected)
              setGitBranchName('No Jira domain configured')
            } else {
              setGitBranchName('Set your Jira domain in Options')
            }
          })
        }

        setConfiguredDomain(domain)
        return queryActiveTabs().then((tabs) => {
          const tab = tabs && tabs[0]
          const url = (tab && tab.url) ? tab.url : ''

          if (!isJiraDomain(url, domain)) {
            setGitBranchName(WRONG_PAGE_MESSAGE)
            return undefined
          }

          if (!tab || !tab.id) {
            setGitBranchName(ERROR_MESSAGE)
            setIsError(true)
            return undefined
          }

          return executeScript(tab.id, () => document.documentElement.outerHTML)
            .then(
              (results) => {
                const html = (results && results[0]) ? results[0].result : ''
                if (!html) {
                  setGitBranchName(ERROR_MESSAGE)
                  setIsError(true)
                  return
                }

                try {
                  const result = buildBranchNameFromHtml(html)
                  setGitBranchName(result)
                  setHasBranchName(true)
                } catch (e) {
                  const message = String(e)
                  if (message.includes('Could not find')) {
                    setGitBranchName(PARSE_ERROR_MESSAGE)
                  } else {
                    setGitBranchName('Error: ' + message)
                  }
                  setIsError(true)
                }
              },
              () => {
                setGitBranchName(ERROR_MESSAGE)
                setIsError(true)
              },
            )
        })
      })
      .then(
        () => {
          settled = true
          clearTimeout(timeout)
        },
        (err) => {
          settled = true
          clearTimeout(timeout)
          const message = String(err)
          if (message.includes('Could not find')) {
            setGitBranchName(PARSE_ERROR_MESSAGE)
          } else {
            setGitBranchName('Error: ' + message)
          }
          setIsError(true)
        },
      )
  }, [])

  const handleCopy = () => {
    copyToClipboard(gitBranchName).then((ok) => {
      setCopyStatus(ok ? 'Copied!' : 'Copy failed')
      if (ok) {
        setCopied(true)
      }
    })
  }

  const handleUseDomain = () => {
    saveDomain(suggestedDomain).then(() => {
      setSuggestedDomain('')
      window.location.reload()
    })
  }

  const logoClass = 'logo' + (copied ? ' logo-success' : '')
  const messageClass = 'branch-name' + (isError ? ' branch-error' : '')

  const pencilIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
    </svg>
  )

  const tickIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )

  return (
    <div className="popup">
      <img src="images/logo.svg" alt="Bran Flakes" className={logoClass} />
      {hasBranchName && (
        <div className="actions">
          <button onClick={handleCopy} className="btn-copy">Copy</button>
          {copyStatus && <span className="copy-status">{copyStatus}</span>}
        </div>
      )}
      {hasBranchName ? (
        <div className="branch-name-row">
          {isEditing ? (
            <input
              className="branch-name branch-name-input"
              value={gitBranchName}
              onChange={(e) => setGitBranchName(e.target.value)}
              autoFocus={true}
            />
          ) : (
            <div className="branch-name">{gitBranchName}</div>
          )}
          <button
            className="btn-icon"
            onClick={() => setIsEditing(!isEditing)}
            title={isEditing ? 'Done editing' : 'Edit branch name'}
          >
            {isEditing ? tickIcon : pencilIcon}
          </button>
        </div>
      ) : (
        <div className={messageClass}>{gitBranchName}</div>
      )}
      {!hasBranchName && configuredDomain && !suggestedDomain && (
        <div className="domain-hint">Configured domain: {configuredDomain}</div>
      )}
      {suggestedDomain && (
        <div className="suggest-domain">
          <p>Use <strong>{suggestedDomain}</strong> as your Jira domain?</p>
          <button onClick={handleUseDomain}>Yes, save it</button>
        </div>
      )}
    </div>
  )
}

export default App
