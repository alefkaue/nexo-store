import { COLLECTIONS, categoryName } from '../domain/catalog'
import type { Filters as FilterValues } from '../domain/catalog'
import type { Product } from '../domain/types'
import { money } from '../domain/cart'

export function Filters({
  filters,
  products,
  onChange,
  onReset,
  prefix = 'filters',
}: {
  filters: FilterValues
  products: Product[]
  onChange: (key: string, value: string) => void
  onReset: () => void
  prefix?: string
}) {
  const brands = [
    ...new Set(
      products
        .filter((p) => !filters.category || p.category === filters.category)
        .map((p) => p.brand)
        .filter((x): x is string => Boolean(x)),
    ),
  ].sort()
  return (
    <div className="filters">
      <div className="filters__title">
        <h2>Filtrar por</h2>
        <button className="text-button" onClick={onReset}>
          Limpar
        </button>
      </div>
      <fieldset>
        <legend>Categorias</legend>
        <label className="radio-label">
          <input
            type="radio"
            name={`${prefix}-category`}
            checked={!filters.category}
            onChange={() => onChange('categoria', '')}
          />
          Todos os produtos
        </label>
        {COLLECTIONS.map((c) => (
          <label className="radio-label" key={c.slug}>
            <input
              type="radio"
              name={`${prefix}-category`}
              checked={filters.category === c.slug}
              onChange={() => onChange('categoria', c.slug)}
            />
            {categoryName(c.slug)}
            <span>{products.filter((p) => p.category === c.slug).length}</span>
          </label>
        ))}
      </fieldset>
      <fieldset>
        <legend>Seu orçamento</legend>
        <label htmlFor={`${prefix}-price`} className="filter-label">
          Preço máximo
        </label>
        <select
          id={`${prefix}-price`}
          value={Number.isFinite(filters.maxPrice) ? String(filters.maxPrice) : ''}
          onChange={(e) => onChange('max', e.target.value)}
        >
          <option value="">Todos os preços</option>
          {[50, 100, 300, 1000, 2000].map((n) => (
            <option value={n} key={n}>
              Até {money(n * 100)}
            </option>
          ))}
        </select>
      </fieldset>
      <fieldset>
        <legend>Marca</legend>
        <label className="sr-only" htmlFor={`${prefix}-brand`}>
          Filtrar por marca
        </label>
        <select
          id={`${prefix}-brand`}
          value={filters.brand}
          onChange={(e) => onChange('marca', e.target.value)}
        >
          <option value="">Todas as marcas</option>
          {brands.map((b) => (
            <option key={b}>{b}</option>
          ))}
        </select>
      </fieldset>
      <fieldset>
        <legend>Disponibilidade</legend>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={filters.inStock}
            onChange={(e) => onChange('estoque', e.target.checked ? 'sim' : '')}
          />
          Somente em estoque
        </label>
      </fieldset>
      <div className="filter-note">
        <span className="eyebrow">UM DETALHE IMPORTANTE</span>
        <p>Os produtos e preços fazem parte de uma experiência de compra simulada.</p>
      </div>
    </div>
  )
}
