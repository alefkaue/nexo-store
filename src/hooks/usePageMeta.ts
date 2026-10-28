import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
export function usePageMeta(title: string, description: string) {
  const location = useLocation()
  useEffect(() => {
    document.title = `${title} | NEXO Store`
    const set = (selector: string, attribute: string, value: string) =>
      document.querySelector(selector)?.setAttribute(attribute, value)
    set('meta[name="description"]', 'content', description)
    set('meta[property="og:title"]', 'content', document.title)
    set('meta[property="og:description"]', 'content', description)
    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.append(canonical)
    }
    canonical.href =
      window.location.origin + import.meta.env.BASE_URL.replace(/\/$/, '') + location.pathname
  }, [title, description, location.pathname])
}
