import { Heart, Plus, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Product } from '../domain/types'
import { categoryName } from '../domain/catalog'
import { cents, money } from '../domain/cart'
import { useStore } from '../state/store-context'
import { ProductImage } from './primitives'

export function ProductCard({ product }: { product: Product }) {
  const store = useStore()
  const saved = store.favorites.includes(product.id)
  return (
    <article className="product-card" data-testid="product-card">
      <div className="product-card__visual">
        <Link to={`/produto/${product.id}`} aria-label={`Ver ${product.title}`}>
          <ProductImage src={product.thumbnail} alt={product.title} />
        </Link>
        <button
          className={`icon-button favorite-button ${saved ? 'is-saved' : ''}`}
          aria-label={`${saved ? 'Remover' : 'Adicionar'} ${product.title} ${saved ? 'dos' : 'aos'} favoritos`}
          aria-pressed={saved}
          onClick={() => store.favorite(product.id)}
        >
          <Heart size={18} aria-hidden="true" fill={saved ? 'currentColor' : 'none'} />
        </button>
        {product.stock === 0 && <span className="product-card__stock">Indisponível</span>}
      </div>
      <div className="product-card__eyebrow">
        <span>{categoryName(product.category)}</span>
        <span>
          <Star size={11} fill="currentColor" aria-hidden="true" />
          {product.rating.toFixed(1)}
        </span>
      </div>
      <h3>
        <Link to={`/produto/${product.id}`}>{product.title}</Link>
      </h3>
      <div className="product-card__bottom">
        <div>
          <strong>{money(cents(product.price))}</strong>
          <span>Preço demonstrativo</span>
        </div>
        <button
          className="add-button"
          aria-label={`Adicionar ${product.title} ao carrinho`}
          disabled={product.stock === 0}
          onClick={() => store.add(product)}
        >
          <Plus size={19} aria-hidden="true" />
        </button>
      </div>
    </article>
  )
}
