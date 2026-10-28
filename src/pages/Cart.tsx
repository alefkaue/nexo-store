import { Link } from 'react-router-dom'
import { ArrowRight, ChevronRight, Trash2 } from 'lucide-react'
import { useStore } from '../state/store-context'
import { useCatalog } from '../state/catalog-context'
import { cartLines, cents, money, totals } from '../domain/cart'
import {
  EmptyState,
  ErrorState,
  ProductImage,
  Quantity,
  SkeletonGrid,
} from '../components/primitives'
import { OrderSummary } from '../components/OrderSummary'
import { usePageMeta } from '../hooks/usePageMeta'

export default function Cart() {
  usePageMeta(
    'Seu carrinho',
    'Revise suas escolhas, altere quantidades e continue para uma experiência de checkout simulada.',
  )
  const store = useStore()
  const { products, loading, error, reload } = useCatalog()
  const lines = cartLines(store.cart, products)
  const missing = store.cart.filter((i) => !products.some((p) => p.id === i.id))
  const valid = lines.every((l) => l.available) && missing.length === 0
  const values = totals(lines)
  return (
    <div className="container cart-page">
      <nav className="breadcrumb" aria-label="Localização">
        <Link to="/">Início</Link>
        <ChevronRight size={12} aria-hidden="true" />
        <span>Carrinho</span>
      </nav>
      <div className="page-heading">
        <span className="eyebrow">UM POUCO MAIS PERTO</span>
        <h1>Seu carrinho.</h1>
        <p>Boas escolhas merecem um segundo olhar.</p>
      </div>
      {!store.cart.length ? (
        <EmptyState
          title="Seu próximo favorito está lá fora."
          description="O carrinho ainda está vazio. Explore a seleção e encontre o que combina com você."
          icon="bag"
        />
      ) : loading && !products.length ? (
        <SkeletonGrid count={3} />
      ) : error ? (
        <ErrorState message={error} onRetry={() => void reload().catch(() => undefined)} />
      ) : (
        <div className="cart-layout">
          <section aria-label="Itens do carrinho">
            <div className="cart-table-heading">
              <span>Produto</span>
              <span>Quantidade e valor</span>
            </div>
            {lines.map(({ product: p, quantity, available }) => (
              <article className="cart-line" key={p.id} data-testid="cart-line">
                <Link to={`/produto/${p.id}`}>
                  <ProductImage src={p.thumbnail} alt={p.title} />
                </Link>
                <div className="cart-line__info">
                  <span className="eyebrow">{p.brand ?? 'SELEÇÃO NEXO'}</span>
                  <h2>
                    <Link to={`/produto/${p.id}`}>{p.title}</Link>
                  </h2>
                  <p>{money(cents(p.price))} por unidade</p>
                  {!available && (
                    <p role="alert" className="field-error">
                      Estoque alterado. Ajuste a quantidade ou remova este produto.
                    </p>
                  )}
                  <button className="text-button remove-button" onClick={() => store.remove(p.id)}>
                    <Trash2 size={13} aria-hidden="true" />
                    Remover
                  </button>
                </div>
                <div className="cart-line__values">
                  <Quantity
                    value={quantity}
                    max={p.stock}
                    onChange={(q) => store.quantity(p.id, q, p.stock)}
                  />
                  <strong>{money(cents(p.price) * quantity)}</strong>
                </div>
              </article>
            ))}
            {missing.map((i) => (
              <article className="cart-line" key={i.id}>
                <p>O produto #{i.id} não está mais disponível no catálogo.</p>
                <button className="text-button" onClick={() => store.remove(i.id)}>
                  Remover produto indisponível
                </button>
              </article>
            ))}
            <div className="cart-footer-note">
              {values.subtotal < 29900 ? (
                <p>
                  Faltam <strong>{money(29900 - values.subtotal)}</strong> para o frete grátis
                  simulado.
                </p>
              ) : (
                <p>
                  Seu pedido tem <strong>frete grátis</strong> na simulação.
                </p>
              )}
              <Link className="text-link" to="/catalogo">
                Continuar explorando
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </section>
          <OrderSummary lines={lines}>
            {valid ? (
              <Link className="button button--dark button--full" to="/checkout">
                Continuar para a simulação
                <ArrowRight size={17} aria-hidden="true" />
              </Link>
            ) : (
              <p className="field-error">Revise os itens indisponíveis antes de continuar.</p>
            )}
          </OrderSummary>
        </div>
      )}
    </div>
  )
}
