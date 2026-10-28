import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowRight, ChevronLeft, ChevronRight, Search, SlidersHorizontal, X } from 'lucide-react'
import { Filters } from '../components/Filters'
import { ProductCard } from '../components/ProductCard'
import { EmptyState, ErrorState, Modal, SkeletonGrid } from '../components/primitives'
import { categoryName, filterProducts, isCurated, paginate, readFilters } from '../domain/catalog'
import { useCatalog } from '../state/catalog-context'
import { usePageMeta } from '../hooks/usePageMeta'

export default function Catalog() {
  const { products, loading, error, reload } = useCatalog()
  const [params, setParams] = useSearchParams()
  const [showFilters, setShowFilters] = useState(false)
  const filters = readFilters(params)
  const filtered = filterProducts(products, filters)
  const result = paginate(filtered, filters.page)
  const title = filters.category
    ? categoryName(filters.category)
    : filters.collection === 'tech'
      ? 'Tecnologia'
      : filters.collection === 'home'
        ? 'Casa & design'
        : 'Explore novas conexões.'
  usePageMeta(
    filters.query ? `Busca: ${filters.query}` : title,
    'Explore produtos de tecnologia e casa. Pesquise, compare marcas, filtre preços e encontre sua próxima escolha na NEXO Store.',
  )
  function change(key: string, value: string) {
    setParams(
      (previous) => {
        const next = new URLSearchParams(previous)
        next.delete('page')
        if (value) next.set(key, value)
        else next.delete(key)
        if (key === 'categoria') {
          next.delete('marca')
          next.delete('colecao')
        }
        return next
      },
      { replace: key === 'q' },
    )
  }
  const reset = () => setParams({})
  return (
    <div className="container catalog-page">
      <nav className="breadcrumb" aria-label="Localização">
        <Link to="/">Início</Link>
        <ChevronRight size={12} aria-hidden="true" />
        <span>Catálogo</span>
      </nav>
      <div className="catalog-heading">
        <div>
          <span className="eyebrow">SUA PRÓXIMA BOA ESCOLHA</span>
          <h1>{title}</h1>
          <p>Encontre o que faz sentido para o seu dia a dia.</p>
        </div>
        <span className="catalog-heading__mark" aria-hidden="true">
          N.
        </span>
      </div>
      <div className="catalog-layout">
        <aside className="desktop-filters" aria-label="Filtros de produtos">
          <Filters
            filters={filters}
            products={products.filter(isCurated)}
            onChange={change}
            onReset={reset}
          />
        </aside>
        <section className="catalog-results" aria-label="Resultados do catálogo">
          <div className="catalog-toolbar">
            <div className="catalog-query">
              <Search size={18} aria-hidden="true" />
              <input
                type="search"
                aria-label="Pesquisar produtos no catálogo"
                placeholder="Busque por produto, marca ou categoria"
                value={filters.query}
                onChange={(e) => change('q', e.target.value)}
                maxLength={120}
              />
              {filters.query && (
                <button
                  aria-label="Limpar pesquisa"
                  className="icon-button"
                  onClick={() => change('q', '')}
                >
                  <X size={15} aria-hidden="true" />
                </button>
              )}
            </div>
            <button className="filter-toggle" onClick={() => setShowFilters(true)}>
              <SlidersHorizontal size={16} aria-hidden="true" />
              Filtros
            </button>
          </div>
          <div className="results-bar">
            <p role="status">
              {loading && !products.length
                ? 'Buscando a sua seleção…'
                : `${filtered.length} ${filtered.length === 1 ? 'produto encontrado' : 'produtos encontrados'}`}
            </p>
            <label>
              Ordenar por
              <select
                aria-label="Ordenar produtos"
                value={filters.sort}
                onChange={(e) => change('ordem', e.target.value)}
              >
                <option value="relevancia">Seleção NEXO</option>
                <option value="menor-preco">Menor preço</option>
                <option value="maior-preco">Maior preço</option>
                <option value="avaliacao">Melhor avaliação</option>
                <option value="nome">Nome, de A a Z</option>
              </select>
            </label>
          </div>
          {(filters.collection ||
            filters.category ||
            Number.isFinite(filters.maxPrice) ||
            filters.brand ||
            filters.inStock) && (
            <div className="active-filters">
              {[
                [
                  'colecao',
                  filters.collection === 'tech'
                    ? 'Tecnologia'
                    : filters.collection === 'home'
                      ? 'Casa & design'
                      : '',
                ],
                ['categoria', filters.category ? categoryName(filters.category) : ''],
                ['marca', filters.brand],
                ['max', Number.isFinite(filters.maxPrice) ? `Até R$ ${filters.maxPrice}` : ''],
                ['estoque', filters.inStock ? 'Em estoque' : ''],
              ]
                .filter(([, v]) => v)
                .map(([k, v]) => (
                  <button key={k} onClick={() => change(k, '')} aria-label={`Remover filtro ${v}`}>
                    {v}
                    <X size={12} aria-hidden="true" />
                  </button>
                ))}
            </div>
          )}
          {loading && !products.length ? (
            <SkeletonGrid count={9} />
          ) : error ? (
            <ErrorState message={error} onRetry={() => void reload().catch(() => undefined)} />
          ) : !filtered.length ? (
            <EmptyState
              title="Ainda não é essa conexão."
              description="Não encontramos produtos com esses filtros. Experimente outra busca ou limpe sua seleção."
              action="Recomeçar a busca"
              to="/catalogo"
            />
          ) : (
            <>
              <div className="product-grid product-grid--catalog">
                {result.items.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
              <nav className="pagination" aria-label="Páginas do catálogo">
                <button
                  aria-label="Página anterior"
                  disabled={result.page === 1}
                  onClick={() => change('page', String(result.page - 1))}
                >
                  <ChevronLeft size={17} aria-hidden="true" />
                </button>
                {Array.from({ length: result.pages }, (_, i) => (
                  <button
                    key={i}
                    aria-label={`Página ${i + 1}`}
                    aria-current={result.page === i + 1 ? 'page' : undefined}
                    onClick={() => change('page', String(i + 1))}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  aria-label="Próxima página"
                  disabled={result.page === result.pages}
                  onClick={() => change('page', String(result.page + 1))}
                >
                  <ChevronRight size={17} aria-hidden="true" />
                </button>
              </nav>
            </>
          )}
        </section>
      </div>
      <Modal open={showFilters} onClose={() => setShowFilters(false)} title="Ajuste sua seleção">
        <Filters
          filters={filters}
          products={products.filter(isCurated)}
          onChange={change}
          onReset={reset}
          prefix="mobile-filters"
        />
        <button className="button button--full" onClick={() => setShowFilters(false)}>
          Ver {filtered.length} produtos
          <ArrowRight size={16} aria-hidden="true" />
        </button>
      </Modal>
    </div>
  )
}
