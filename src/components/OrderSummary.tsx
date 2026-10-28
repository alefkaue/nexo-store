import type { ReactNode } from 'react'
import type { CartLine, Delivery } from '../domain/types'
import { money, totals } from '../domain/cart'
import { ShieldCheck } from 'lucide-react'
export function OrderSummary({
  lines,
  delivery = 'standard',
  children,
}: {
  lines: CartLine[]
  delivery?: Delivery
  children?: ReactNode
}) {
  const values = totals(lines, delivery)
  return (
    <aside className="order-summary" aria-label="Resumo do pedido">
      <span className="eyebrow">SUAS ESCOLHAS, EM RESUMO</span>
      <h2>Quase uma nova conexão.</h2>
      <dl>
        <div>
          <dt>
            Subtotal ({values.count} {values.count === 1 ? 'item' : 'itens'})
          </dt>
          <dd data-testid="subtotal">{money(values.subtotal)}</dd>
        </div>
        <div>
          <dt>{delivery === 'pickup' ? 'Retirada demonstrativa' : 'Frete simulado'}</dt>
          <dd>{values.shipping === 0 ? 'Grátis' : money(values.shipping)}</dd>
        </div>
        <div className="order-summary__total">
          <dt>Total</dt>
          <dd data-testid="total">{money(values.total)}</dd>
        </div>
      </dl>
      {children}
      <p className="order-summary__note">
        <ShieldCheck size={17} aria-hidden="true" />
        Sem cobrança. Sem dados de pagamento. É uma simulação.
      </p>
    </aside>
  )
}
