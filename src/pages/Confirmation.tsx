import { Link, useLocation } from 'react-router-dom'
import { ArrowRight, Check } from 'lucide-react'
import type { DemoOrder } from '../domain/types'
import { money } from '../domain/cart'
import { usePageMeta } from '../hooks/usePageMeta'
import { EmptyState } from '../components/primitives'
export default function Confirmation() {
  usePageMeta(
    'Simulação concluída',
    'A experiência de checkout foi concluída sem pagamentos reais ou envio de dados pessoais.',
  )
  const { state } = useLocation()
  const order = state as DemoOrder | null
  if (
    !order ||
    typeof order.reference !== 'string' ||
    !Number.isFinite(order.total) ||
    !Number.isFinite(order.count)
  )
    return (
      <div className="container">
        <EmptyState
          title="Sua próxima experiência espera."
          description="Explore a loja para experimentar o checkout. Não há uma simulação concluída nesta página."
        />
      </div>
    )
  return (
    <section className="container confirmation">
      <span className="confirmation__icon">
        <Check size={40} aria-hidden="true" />
      </span>
      <span className="eyebrow">EXPERIÊNCIA CONCLUÍDA</span>
      <h1>
        Uma boa conexão.
        <br />
        Do início ao fim.
      </h1>
      <p>
        Você percorreu o fluxo completo da NEXO.
        <br />
        Nenhuma compra ou cobrança foi realizada.
      </p>
      <div className="confirmation__receipt">
        <span>Referência demonstrativa</span>
        <strong>{order.reference}</strong>
        <div>
          <span>
            {order.count} {order.count === 1 ? 'item' : 'itens'} na simulação
          </span>
          <strong>{money(order.total)}</strong>
        </div>
      </div>
      <p className="form-help">
        Os dados fictícios do formulário foram descartados. Seus favoritos continuam salvos.
      </p>
      <Link className="button button--dark" to="/catalogo">
        Continuar explorando
        <ArrowRight size={17} aria-hidden="true" />
      </Link>
    </section>
  )
}
