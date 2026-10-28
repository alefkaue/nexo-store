import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  Heart,
  Package,
  Plus,
  Star,
} from 'lucide-react'
import type { Product as ProductType } from '../domain/types'
import { cents, money } from '../domain/cart'
import { categoryName } from '../domain/catalog'
import { fetchProduct, ApiError } from '../services/products'
import { ProductCard } from '../components/ProductCard'
import { EmptyState, ErrorState, ProductImage } from '../components/primitives'
import { useStore } from '../state/store-context'
import { useCatalog } from '../state/catalog-context'
import { usePageMeta } from '../hooks/usePageMeta'

export default function Product() {
  const { id } = useParams()
  const [product, setProduct] = useState<ProductType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notFound, setNotFound] = useState(false)
  const [revision, setRevision] = useState(0)
  const [image, setImage] = useState(0)
  const store = useStore()
  const { products } = useCatalog()
  usePageMeta(
    product?.title ?? 'Detalhes do produto',
    product?.description ?? 'Conheça os detalhes, as imagens e a disponibilidade da seleção NEXO.',
  )
  useEffect(() => {
    const controller = new AbortController()
    let active = true
    setLoading(true)
    setError('')
    setNotFound(false)
    setProduct(null)
    setImage(0)
    void fetchProduct(Number(id), controller.signal)
      .then((p) => {
        if (active) {
          setProduct(p)
          setLoading(false)
        }
      })
      .catch((e) => {
        if (active) {
          setNotFound(e instanceof ApiError && e.status === 404)
          setError(e instanceof Error ? e.message : 'Produto indisponível.')
          setLoading(false)
        }
      })
    return () => {
      active = false
      controller.abort()
    }
  }, [id, revision])
  if (loading)
    return (
      <div className="container product-detail loading-detail" role="status">
        <div className="skeleton" />
        <div>
          <div className="skeleton" />
          <div className="skeleton" />
        </div>
        <span className="sr-only">Carregando produto</span>
      </div>
    )
  if (notFound)
    return (
      <div className="container">
        <EmptyState
          title="Esse produto não está por aqui."
          description="O endereço pode ter mudado. Vamos encontrar outra boa escolha?"
        />
      </div>
    )
  if (error || !product)
    return (
      <div className="container">
        <ErrorState message={error} onRetry={() => setRevision((n) => n + 1)} />
      </div>
    )
  const images = product.images.length ? product.images : [product.thumbnail]
  const saved = store.favorites.includes(product.id)
  return (
    <div className="container product-page">
      <nav className="breadcrumb" aria-label="Localização">
        <Link to="/">Início</Link>
        <ChevronRight size={12} aria-hidden="true" />
        <Link to="/catalogo">Catálogo</Link>
        <ChevronRight size={12} aria-hidden="true" />
        <span>{categoryName(product.category)}</span>
      </nav>
      <Link className="text-link product-back" to={`/catalogo?categoria=${product.category}`}>
        <ArrowLeft size={15} aria-hidden="true" />
        Voltar à seleção
      </Link>
      <div className="product-detail">
        <div className="product-gallery">
          <div className="product-gallery__main">
            <ProductImage
              key={`${product.id}-${image}`}
              src={images[image]}
              alt={`${product.title}, imagem ${image + 1}`}
              eager
            />
          </div>
          {images.length > 1 && (
            <div className="product-gallery__thumbs">
              {images.map((url, i) => (
                <button
                  aria-label={`Ver imagem ${i + 1}`}
                  aria-pressed={image === i}
                  key={url}
                  onClick={() => setImage(i)}
                >
                  <ProductImage src={url} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>
        <section className="product-info">
          <span className="eyebrow">{product.brand ?? categoryName(product.category)}</span>
          <h1>{product.title}</h1>
          <div className="product-rating">
            <Star size={15} fill="currentColor" aria-hidden="true" />
            <strong>{product.rating.toFixed(1)}</strong>
            <span>Avaliação do catálogo demonstrativo</span>
          </div>
          <p className="product-description">{product.description}</p>
          <div className="product-price">
            <strong>{money(cents(product.price))}</strong>
            <span>Valor demonstrativo · sem cobrança real</span>
          </div>
          <p className={`stock-note ${product.stock === 0 ? 'stock-note--empty' : ''}`}>
            {product.stock > 0 ? (
              <Check size={15} aria-hidden="true" />
            ) : (
              <Package size={15} aria-hidden="true" />
            )}
            {product.stock > 0
              ? `${product.stock} unidades disponíveis no catálogo`
              : 'Produto indisponível no momento'}
          </p>
          <div className="product-actions">
            <button
              className="button button--dark"
              disabled={product.stock === 0}
              onClick={() => store.add(product)}
            >
              <Plus size={18} aria-hidden="true" />
              {product.stock > 0 ? 'Adicionar ao carrinho' : 'Indisponível'}
            </button>
            <button
              className={`icon-button product-favorite ${saved ? 'is-saved' : ''}`}
              aria-label={saved ? 'Remover dos favoritos' : 'Salvar nos favoritos'}
              aria-pressed={saved}
              onClick={() => store.favorite(product.id)}
            >
              <Heart aria-hidden="true" fill={saved ? 'currentColor' : 'none'} />
            </button>
          </div>
          <Link to="/carrinho" className="text-link">
            Ver seu carrinho
            <ArrowRight size={15} aria-hidden="true" />
          </Link>
          <div className="product-service">
            <Package size={21} aria-hidden="true" />
            <p>
              <strong>Entrega, do seu jeito.</strong>Na simulação, frete grátis a partir de R$ 299.
              Retirada demonstrativa sempre gratuita.
            </p>
          </div>
          <details>
            <summary>Sobre esta experiência</summary>
            <p>
              Os dados, imagens e a disponibilidade são fornecidos pela DummyJSON. Esta loja é um
              projeto de portfólio: o checkout não cria uma compra ou reserva de estoque.
            </p>
          </details>
        </section>
      </div>
      <section className="section-block">
        <div className="section-heading">
          <div>
            <span className="eyebrow">OUTRAS BOAS CONEXÕES</span>
            <h2>Continue explorando.</h2>
          </div>
        </div>
        <div className="product-grid">
          {products
            .filter((p) => p.category === product.category && p.id !== product.id)
            .slice(0, 4)
            .map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
        </div>
      </section>
    </div>
  )
}
