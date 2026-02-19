import React, { useState, useEffect, useRef } from 'react'
import { main } from './contentscript'
import { loadDomain } from './config'

function App() {
  const [gitBranchName, setGitBranchName] = useState('')
  const [copySuccess, setCopySuccess] = useState('')
  const textAreaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    loadDomain().then((domain) => main(domain)).then(setGitBranchName)
  }, [])

  const copyToClipboard = () => {
    if (textAreaRef.current) {
      textAreaRef.current.select()
      document.execCommand('copy')
      setCopySuccess('Copied!')
    }
  }

  return (
    <div>
      {document.queryCommandSupported('copy') && (
        <div>
          <button onClick={copyToClipboard}>Copy</button>
          {copySuccess}
        </div>
      )}
      <form>
        <textarea ref={textAreaRef} value={gitBranchName} readOnly />
      </form>
    </div>
  )
}

export default App
