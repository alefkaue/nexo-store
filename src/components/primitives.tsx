import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Check, Minus, Plus, SearchX, ShoppingBag, X } from 'lucide-react'

export function ProductImage({
  src,
  alt,
  className = '',
  eager = false,
}: {
  src: string
  alt: string
  className?: string
  eager?: boolean
}) {
  const [failed, setFailed] = useState(false)
  return (
    <img
      src={!src || failed ? `${import.meta.env.BASE_URL}placeholder.svg` : src}
      alt={alt}
      className={className}
      width="400"
      height="400"
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      onError={() => setFailed(true)}
    />
  )
}
export function EmptyState({
  title,
  description,
  action = 'Explorar produtos',
  to = '/catalogo',
  icon = 'search',
}: {
  title: string
  description: string
  action?: string
  to?: string
  icon?: 'search' | 'bag'
}) {
  const Icon = icon === 'bag' ? ShoppingBag : SearchX
  return (
    <section className="empty-state">
      <span className="empty-state__icon">
        <Icon size={28} aria-hidden="true" />
      </span>
      <h2>{title}</h2>
      <p>{description}</p>
      <Link className="button" to={to}>
        {action}
        <ArrowRight size={16} aria-hidden="true" />
      </Link>
    </section>
  )
}
export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <section className="error-state" role="alert">
      <h2>Uma pausa na conexão.</h2>
      <p>{message}</p>
      <button className="button" onClick={onRetry}>
        Tentar novamente
      </button>
    </section>
  )
}
export function SkeletonGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="product-grid" role="status" aria-label="Carregando produtos">
      <span className="sr-only">Carregando produtos</span>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="product-skeleton" aria-hidden="true">
          <div className="skeleton" />
          <span className="skeleton" />
          <span className="skeleton" />
        </div>
      ))}
    </div>
  )
}
export function Quantity({
  value,
  max,
  onChange,
}: {
  value: number
  max: number
  onChange: (quantity: number) => void
}) {
  return (
    <div className="quantity">
      <button
        type="button"
        aria-label="Diminuir quantidade"
        disabled={value <= 1}
        onClick={() => onChange(value - 1)}
      >
        <Minus size={14} aria-hidden="true" />
      </button>
      <output aria-label="Quantidade">{value}</output>
      <button
        type="button"
        aria-label="Aumentar quantidade"
        disabled={value >= Math.min(max, 99)}
        onClick={() => onChange(value + 1)}
      >
        <Plus size={14} aria-hidden="true" />
      </button>
    </div>
  )
}
export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const el = dialog.current
    if (open && el && !el.open) el.showModal()
    else if (!open && el?.open) el.close()
  }, [open])
  return (
    <dialog
      className="dialog"
      ref={dialog}
      aria-label={title}
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === dialog.current) onClose()
      }}
    >
      <div className="dialog__heading">
        <h2>{title}</h2>
        <button className="icon-button" aria-label="Fechar" onClick={onClose}>
          <X aria-hidden="true" />
        </button>
      </div>
      {children}
    </dialog>
  )
}
export function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="badge">
      <Check size={12} aria-hidden="true" />
      {children}
    </span>
  )
}
