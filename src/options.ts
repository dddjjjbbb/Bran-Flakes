import { loadDomain, saveDomain } from './config'

async function init() {
  const input = document.getElementById('domain') as HTMLInputElement
  const status = document.getElementById('status') as HTMLElement
  const form = document.getElementById('options-form') as HTMLFormElement

  input.value = await loadDomain()

  form.addEventListener('submit', async (event) => {
    event.preventDefault()
    const domain = input.value.trim()
    if (!domain) {
      return
    }
    await saveDomain(domain)
    status.textContent = 'Saved!'
    setTimeout(() => { status.textContent = '' }, 1500)
  })
}

init()
