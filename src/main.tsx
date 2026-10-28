import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './app/App'
import './styles/main.scss'

// GitHub Pages devolve 404.html para rotas diretas. Restaure somente um caminho local.
const redirect = new URLSearchParams(window.location.search).get('__path')
if (
  redirect?.startsWith('/') &&
  !redirect.startsWith('//') &&
  ![...redirect].some((char) => char === '\\' || char.charCodeAt(0) < 32)
) {
  window.history.replaceState(null, '', import.meta.env.BASE_URL.replace(/\/$/, '') + redirect)
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
