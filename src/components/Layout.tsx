import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { ArrowUpRight, ArrowRight, Heart, Menu, Search, ShoppingBag, X } from 'lucide-react'
import { useStore } from '../state/store-context'
import { Modal } from './primitives'

function Wordmark() {
  return (
    <span className="wordmark">
      nexo<span className="wordmark__dot">.</span>
      <span className="wordmark__tag">STORE</span>
    </span>
  )
}
export function Layout() {
  const store = useStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [menu, setMenu] = useState(false)
  const [search, setSearch] = useState(false)
  const previousPath = useRef(location.pathname)
  const count = store.cart.reduce((sum, i) => sum + i.quantity, 0)
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const anchor = location.hash ? document.getElementById(location.hash.slice(1)) : null
      if (anchor) anchor.scrollIntoView({ behavior: 'instant' })
      else window.scrollTo({ top: 0, behavior: 'instant' })
      if (previousPath.current !== location.pathname) {
        document.getElementById('conteudo')?.focus({ preventScroll: true })
        previousPath.current = location.pathname
      }
    })
    return () => cancelAnimationFrame(frame)
  }, [location.pathname, location.hash])
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const q = String(new FormData(event.currentTarget).get('q') ?? '').trim()
    setSearch(false)
    navigate(`/catalogo${q ? `?q=${encodeURIComponent(q)}` : ''}`)
  }
  const close = () => setMenu(false)
  return (
    <>
      <a className="skip-link" href="#conteudo">
        Pular para o conteúdo
      </a>
      <div className="announcement">
        <span>O extraordinário está nos detalhes.</span>
        <Link to="/sobre">
          Uma loja para explorar. Uma compra para simular.
          <ArrowUpRight size={12} aria-hidden="true" />
        </Link>
      </div>
      <header className="header">
        <div className="container header__inner">
          <button
            className="icon-button mobile-menu"
            aria-label="Abrir menu"
            onClick={() => setMenu(true)}
          >
            <Menu aria-hidden="true" />
          </button>
          <Link to="/" aria-label="NEXO Store, início">
            <Wordmark />
          </Link>
          <nav className="desktop-nav" aria-label="Navegação principal">
            <NavLink to="/catalogo">Explorar</NavLink>
            <Link to="/catalogo?colecao=tech">Tecnologia</Link>
            <Link to="/catalogo?colecao=home">Casa & design</Link>
            <NavLink to="/sobre">A NEXO</NavLink>
          </nav>
          <div className="header__actions">
            <form className="header-search" onSubmit={submit}>
              <Search size={16} aria-hidden="true" />
              <input
                aria-label="Buscar na loja"
                name="q"
                placeholder="O que conecta com você?"
                maxLength={120}
              />
              <button aria-label="Pesquisar" type="submit">
                <ArrowRight size={16} aria-hidden="true" />
              </button>
            </form>
            <button
              className="icon-button mobile-search"
              aria-label="Abrir busca"
              onClick={() => setSearch(true)}
            >
              <Search aria-hidden="true" />
            </button>
            <Link
              className="icon-button"
              to="/favoritos"
              aria-label={`Favoritos, ${store.favorites.length} produtos`}
            >
              <Heart size={20} aria-hidden="true" />
              {store.favorites.length > 0 && (
                <span className="counter">{store.favorites.length}</span>
              )}
            </Link>
            <Link
              className="icon-button cart-link"
              to="/carrinho"
              aria-label={`Carrinho, ${count} itens`}
            >
              <ShoppingBag size={20} aria-hidden="true" />
              <span className="cart-count">{count}</span>
            </Link>
          </div>
        </div>
      </header>
      {store.storageUnavailable && (
        <p className="storage-warning" role="status">
          O navegador não permitiu salvar suas escolhas. Elas ficarão disponíveis apenas nesta
          sessão.
        </p>
      )}
      <main id="conteudo" tabIndex={-1}>
        <Outlet />
      </main>
      <footer className="footer">
        <div className="container footer__top">
          <div>
            <Link to="/" aria-label="NEXO Store, início">
              <Wordmark />
            </Link>
            <p>
              Boas escolhas.
              <br />
              Novas conexões.
            </p>
            <span>Tecnologia e design para o seu cotidiano.</span>
          </div>
          <nav aria-label="Explorar a loja">
            <h2>Explore</h2>
            <Link to="/catalogo">Todos os produtos</Link>
            <Link to="/catalogo?colecao=tech">Tecnologia</Link>
            <Link to="/catalogo?colecao=home">Casa & design</Link>
          </nav>
          <nav aria-label="Sua seleção">
            <h2>Seu espaço</h2>
            <Link to="/favoritos">Seus favoritos</Link>
            <Link to="/carrinho">Seu carrinho</Link>
            <Link to="/sobre#como-funciona">Como funciona</Link>
          </nav>
          <div className="footer__note">
            <span className="eyebrow">FEITA PARA SER EXPLORADA</span>
            <p>
              Uma experiência completa.
              <br />
              Sem uma compra de verdade.
            </p>
            <Link to="/sobre">
              Conheça o projeto
              <ArrowUpRight size={15} aria-hidden="true" />
            </Link>
          </div>
        </div>
        <div className="container footer__bottom">
          <span>© {new Date().getFullYear()} NEXO Store · Projeto de portfólio</span>
          <span>Loja demonstrativa. Sem pagamentos reais.</span>
          <Link to="/sobre#privacidade">Privacidade</Link>
        </div>
      </footer>
      <div className="toast-region" aria-live="polite" aria-atomic="true">
        {store.message && (
          <div className="toast">
            <ShoppingBag size={18} aria-hidden="true" />
            <span>{store.message}</span>
            <button className="icon-button" aria-label="Dispensar aviso" onClick={store.dismiss}>
              <X size={16} aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
      <Modal open={menu} onClose={close} title="Explore a NEXO">
        <nav className="dialog-nav">
          <Link to="/catalogo" onClick={close}>
            Todos os produtos
            <ArrowUpRight aria-hidden="true" />
          </Link>
          <Link to="/catalogo?colecao=tech" onClick={close}>
            Tecnologia
            <ArrowUpRight aria-hidden="true" />
          </Link>
          <Link to="/catalogo?colecao=home" onClick={close}>
            Casa & design
            <ArrowUpRight aria-hidden="true" />
          </Link>
          <Link to="/sobre" onClick={close}>
            A NEXO
            <ArrowUpRight aria-hidden="true" />
          </Link>
        </nav>
      </Modal>
      <Modal open={search} onClose={() => setSearch(false)} title="O que você procura?">
        <form className="search-form" onSubmit={submit}>
          <label className="sr-only" htmlFor="mobile-q">
            Buscar produtos
          </label>
          <input id="mobile-q" name="q" placeholder="Nome, marca ou categoria" maxLength={120} />
          <button className="button" type="submit">
            Buscar
            <Search size={16} aria-hidden="true" />
          </button>
        </form>
      </Modal>
    </>
  )
}
