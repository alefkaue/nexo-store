import { Component, lazy, Suspense } from 'react'
import type { ReactNode } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { CatalogProvider } from '../state/CatalogProvider'
import { StoreProvider } from '../state/StoreProvider'
import { Layout } from '../components/Layout'
import Home from '../pages/Home'

const Catalog = lazy(() => import('../pages/Catalog'))
const Product = lazy(() => import('../pages/Product'))
const Cart = lazy(() => import('../pages/Cart'))
const Favorites = lazy(() => import('../pages/Favorites'))
const Checkout = lazy(() => import('../pages/Checkout'))
const Confirmation = lazy(() => import('../pages/Confirmation'))
const About = lazy(() => import('../pages/About'))
const NotFound = lazy(() => import('../pages/NotFound'))

class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? (
      <main className="container error-state">
        <h1>Precisamos reconectar.</h1>
        <p>
          Ocorreu um erro inesperado ao abrir a loja. Suas escolhas salvas permanecem no navegador.
        </p>
        <button className="button" onClick={() => window.location.reload()}>
          Recarregar a loja
        </button>
      </main>
    ) : (
      this.props.children
    )
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      {/* Filters use the URL as controlled input state, so updates must be synchronous. */}
      <BrowserRouter basename={import.meta.env.BASE_URL} useTransitions={false}>
        <StoreProvider>
          <CatalogProvider>
            <Suspense
              fallback={
                <div className="container route-loading" role="status">
                  Preparando sua próxima conexão…
                </div>
              }
            >
              <Routes>
                <Route element={<Layout />}>
                  <Route index element={<Home />} />
                  <Route path="catalogo" element={<Catalog />} />
                  <Route path="produto/:id" element={<Product />} />
                  <Route path="carrinho" element={<Cart />} />
                  <Route path="favoritos" element={<Favorites />} />
                  <Route path="checkout" element={<Checkout />} />
                  <Route path="pedido-confirmado" element={<Confirmation />} />
                  <Route path="sobre" element={<About />} />
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </Suspense>
          </CatalogProvider>
        </StoreProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
