import { loadDomain, saveDomain } from './config'

function showViewMode(domain: string) {
  const viewMode = document.getElementById('view-mode') as HTMLElement
  const editMode = document.getElementById('edit-mode') as HTMLElement
  const domainDisplay = document.getElementById('domain-display') as HTMLElement

  domainDisplay.textContent = domain
  viewMode.classList.remove('hidden')
  editMode.classList.add('hidden')
}

function showEditMode(currentDomain: string) {
  const viewMode = document.getElementById('view-mode') as HTMLElement
  const editMode = document.getElementById('edit-mode') as HTMLElement
  const input = document.getElementById('domain') as HTMLInputElement

  input.value = currentDomain
  viewMode.classList.add('hidden')
  editMode.classList.remove('hidden')
  input.focus()
}

function init() {
  const form = document.getElementById('options-form') as HTMLFormElement
  const input = document.getElementById('domain') as HTMLInputElement
  const status = document.getElementById('status') as HTMLElement
  const editBtn = document.getElementById('edit-btn') as HTMLButtonElement

  let savedDomain = ''

  loadDomain().then((currentDomain) => {
    savedDomain = currentDomain
    if (currentDomain) {
      showViewMode(currentDomain)
    } else {
      showEditMode('')
    }
  })

  editBtn.addEventListener('click', () => {
    showEditMode(savedDomain)
  })

  form.addEventListener('submit', (event) => {
    event.preventDefault()
    const domain = input.value.trim()
    if (!domain) {
      return
    }
    saveDomain(domain).then(() => {
      savedDomain = domain
      status.textContent = 'Saved!'
      setTimeout(() => { status.textContent = '' }, 1500)
      showViewMode(domain)
    })
  })
}

init()
