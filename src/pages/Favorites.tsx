import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { useStore } from '../state/store-context'
import { useCatalog } from '../state/catalog-context'
import { ProductCard } from '../components/ProductCard'
import { EmptyState, ErrorState, SkeletonGrid } from '../components/primitives'
import { usePageMeta } from '../hooks/usePageMeta'
export default function Favorites() {
  usePageMeta(
    'Seus favoritos',
    'Uma seleção que é só sua. Guarde os produtos que combinam com você e continue explorando depois.',
  )
  const store = useStore()
  const { products, error, loading, reload } = useCatalog()
  const saved = products.filter((p) => store.favorites.includes(p.id))
  const missing = store.favorites.filter((id) => !products.some((p) => p.id === id))
  return (
    <div className="container favorites-page">
      <nav className="breadcrumb" aria-label="Localização">
        <Link to="/">Início</Link>
        <ChevronRight size={12} aria-hidden="true" />
        <span>Favoritos</span>
      </nav>
      <div className="page-heading">
        <span className="eyebrow">GUARDE O QUE CONECTA</span>
        <h1>Sua seleção particular.</h1>
        <p>Os favoritos de hoje podem ser as boas escolhas de amanhã.</p>
      </div>
      {!store.favorites.length ? (
        <EmptyState
          title="Sua curadoria começa com um coração."
          description="Toque no coração de um produto para guardá-lo aqui. Sem cadastro, do seu jeito."
        />
      ) : loading && !products.length ? (
        <SkeletonGrid />
      ) : error ? (
        <ErrorState message={error} onRetry={() => void reload().catch(() => undefined)} />
      ) : (
        <>
          {missing.length > 0 && (
            <p className="notice">
              Alguns favoritos saíram do catálogo.{' '}
              <button
                className="text-button"
                onClick={() => missing.forEach((id) => store.favorite(id))}
              >
                Remover indisponíveis
              </button>
            </p>
          )}
          <div className="product-grid">
            {saved.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
