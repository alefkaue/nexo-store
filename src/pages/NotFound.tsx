import { usePageMeta } from '../hooks/usePageMeta'
import { EmptyState } from '../components/primitives'
export default function NotFound() {
  usePageMeta(
    'Página não encontrada',
    'Este endereço não existe na NEXO Store. Explore o catálogo para continuar.',
  )
  return (
    <div className="container">
      <EmptyState
        title="Essa conexão não existe. Ainda."
        description="Não encontramos esta página. O catálogo é um bom lugar para recomeçar."
      />
    </div>
  )
}
