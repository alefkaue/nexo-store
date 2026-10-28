import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, ChevronRight, LoaderCircle, ShieldCheck } from 'lucide-react'
import { useCatalog } from '../state/catalog-context'
import { useStore } from '../state/store-context'
import { cartChanged, cartLines, totals } from '../domain/cart'
import type { DemoOrder } from '../domain/types'
import { validateCheckout } from '../domain/checkout'
import type { CheckoutForm, FormErrors } from '../domain/checkout'
import { OrderSummary } from '../components/OrderSummary'
import { EmptyState, ErrorState, SkeletonGrid } from '../components/primitives'
import { usePageMeta } from '../hooks/usePageMeta'

export default function Checkout() {
  usePageMeta(
    'Checkout demonstrativo',
    'Experimente um checkout completo sem pagamentos reais, sem CPF, sem endereço e sem dados de cartão.',
  )
  const store = useStore()
  const { products, loading, error, reload } = useCatalog()
  const navigate = useNavigate()
  const [form, setForm] = useState<CheckoutForm>({
    nickname: '',
    email: '',
    city: '',
    delivery: 'standard',
    agreed: false,
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [failure, setFailure] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const locked = useRef(false)
  const formRef = useRef<HTMLFormElement>(null)
  const lines = cartLines(store.cart, products)
  const valid = lines.length === store.cart.length && lines.every((l) => l.available)
  function field<K extends keyof CheckoutForm>(name: K, value: CheckoutForm[K]) {
    setForm((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
    setFailure('')
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (locked.current) return
    const validation = validateCheckout(form)
    setErrors(validation)
    if (Object.keys(validation).length) {
      requestAnimationFrame(() =>
        formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(),
      )
      return
    }
    if (!valid || !lines.length) {
      setFailure('Revise os itens do carrinho antes de continuar.')
      return
    }
    locked.current = true
    setSubmitting(true)
    setFailure('')
    try {
      // Somente GET de produtos: nenhum dado do formulário é enviado.
      const fresh = await reload()
      if (cartChanged(lines, fresh)) {
        setFailure('O preço ou o estoque mudou. Revise o carrinho antes de simular novamente.')
        return
      }
      const summary = totals(cartLines(store.cart, fresh), form.delivery)
      const order: DemoOrder = {
        reference: `NEXO-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
        count: summary.count,
        total: summary.total,
      }
      store.clear()
      navigate('/pedido-confirmado', { replace: true, state: order })
    } catch {
      setFailure(
        'A confirmação precisa consultar o catálogo. Confira a conexão e tente novamente. Seu carrinho foi preservado.',
      )
    } finally {
      locked.current = false
      setSubmitting(false)
    }
  }
  if (!store.cart.length)
    return (
      <div className="container">
        <EmptyState
          title="Primeiro, uma boa escolha."
          description="Adicione um produto ao carrinho para experimentar o checkout demonstrativo."
          icon="bag"
        />
      </div>
    )
  return (
    <div className="container checkout-page">
      <nav className="breadcrumb" aria-label="Localização">
        <Link to="/carrinho">Carrinho</Link>
        <ChevronRight size={12} aria-hidden="true" />
        <span>Checkout simulado</span>
      </nav>
      <div className="page-heading">
        <span className="eyebrow">EXPERIMENTE O ÚLTIMO PASSO</span>
        <h1>Uma compra. Só de mentirinha.</h1>
        <p>Explore o fluxo completo usando apenas informações fictícias.</p>
      </div>
      <div className="demo-banner">
        <ShieldCheck aria-hidden="true" />
        <p>
          <strong>Este checkout é uma demonstração.</strong> Não informe dados reais. Não pedimos
          CPF, endereço completo ou informações de pagamento. Nada deste formulário é enviado ou
          salvo.
        </p>
      </div>
      {loading && !products.length ? (
        <SkeletonGrid count={2} />
      ) : error && !products.length ? (
        <ErrorState message={error} onRetry={() => void reload().catch(() => undefined)} />
      ) : (
        <div className="checkout-layout">
          <form id="checkout-form" ref={formRef} onSubmit={submit} noValidate autoComplete="off">
            <div className="form-section-heading">
              <span>01</span>
              <h2>Identificação fictícia</h2>
            </div>
            <p className="form-help">
              Pode inventar. Usamos esses campos apenas para demonstrar a validação.
            </p>
            <div className="form-fields">
              {[
                {
                  name: 'nickname' as const,
                  label: 'Apelido fictício',
                  placeholder: 'Ex.: Nexo Demo',
                  type: 'text',
                  max: 60,
                },
                {
                  name: 'email' as const,
                  label: 'E-mail fictício',
                  placeholder: 'Ex.: demo@example.com',
                  type: 'email',
                  max: 120,
                },
                {
                  name: 'city' as const,
                  label: 'Cidade fictícia',
                  placeholder: 'Ex.: Cidade Exemplo',
                  type: 'text',
                  max: 80,
                },
              ].map((f) => (
                <div className="form-field" key={f.name}>
                  <label htmlFor={f.name}>{f.label}</label>
                  <input
                    id={f.name}
                    name={f.name}
                    type={f.type}
                    required
                    maxLength={f.max}
                    placeholder={f.placeholder}
                    value={form[f.name]}
                    onChange={(e) => field(f.name, e.target.value)}
                    aria-invalid={Boolean(errors[f.name])}
                    aria-describedby={errors[f.name] ? `${f.name}-error` : undefined}
                  />
                  {errors[f.name] && (
                    <p id={`${f.name}-error`} className="field-error">
                      {errors[f.name]}
                    </p>
                  )}
                </div>
              ))}
            </div>
            <div className="form-section-heading">
              <span>02</span>
              <h2>Entrega demonstrativa</h2>
            </div>
            <fieldset className="delivery-options">
              <legend className="sr-only">Escolha a entrega simulada</legend>
              <label className={form.delivery === 'standard' ? 'selected' : ''}>
                <input
                  type="radio"
                  name="delivery"
                  value="standard"
                  checked={form.delivery === 'standard'}
                  onChange={() => field('delivery', 'standard')}
                />
                <span>
                  <strong>Entrega simulada</strong>Grátis a partir de R$ 299; abaixo, R$ 19,90
                </span>
              </label>
              <label className={form.delivery === 'pickup' ? 'selected' : ''}>
                <input
                  type="radio"
                  name="delivery"
                  value="pickup"
                  checked={form.delivery === 'pickup'}
                  onChange={() => field('delivery', 'pickup')}
                />
                <span>
                  <strong>Retirada demonstrativa</strong>Sem custo, sem agendamento real
                </span>
              </label>
            </fieldset>
            <label className="checkbox-label confirmation-check">
              <input
                type="checkbox"
                checked={form.agreed}
                onChange={(e) => field('agreed', e.target.checked)}
                aria-invalid={Boolean(errors.agreed)}
                aria-describedby={errors.agreed ? 'agreed-error' : undefined}
              />
              Entendo que esta simulação não cria uma compra real.
            </label>
            {errors.agreed && (
              <p id="agreed-error" className="field-error">
                {errors.agreed}
              </p>
            )}
            {(!valid || failure) && (
              <p role="alert" className="notice notice--error">
                {failure || 'Há produtos indisponíveis. Revise o carrinho.'}{' '}
                <Link to="/carrinho">Revisar carrinho</Link>
              </p>
            )}
            <Link to="/carrinho" className="text-link">
              <ArrowLeft size={15} aria-hidden="true" />
              Voltar ao carrinho
            </Link>
          </form>
          <OrderSummary lines={lines} delivery={form.delivery}>
            <button
              type="submit"
              form="checkout-form"
              className="button button--dark button--full"
              disabled={submitting || !valid}
            >
              {submitting ? (
                <>
                  <LoaderCircle size={17} className="spin" aria-hidden="true" />
                  Conferindo catálogo…
                </>
              ) : (
                <>
                  Concluir simulação
                  <ArrowRight size={17} aria-hidden="true" />
                </>
              )}
            </button>
            <p className="summary-small">
              <Check size={13} aria-hidden="true" />
              Estoque e preços conferidos antes de concluir
            </p>
          </OrderSummary>
        </div>
      )}
    </div>
  )
}
