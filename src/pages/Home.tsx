import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Headphones,
  Laptop,
  Leaf,
  Package,
  Smartphone,
  Sparkles,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { ProductCard } from '../components/ProductCard'
import { ErrorState, SkeletonGrid } from '../components/primitives'
import { useCatalog } from '../state/catalog-context'
import { usePageMeta } from '../hooks/usePageMeta'
import { isCurated } from '../domain/catalog'

export default function Home() {
  usePageMeta(
    'O essencial, em uma nova perspectiva',
    'Explore a curadoria NEXO de tecnologia, acessórios e design para casa. Uma experiência de e-commerce demonstrativa, sem pagamentos reais.',
  )
  const { products, loading, error, reload } = useCatalog()
  const categories = [
    'laptops',
    'smartphones',
    'mobile-accessories',
    'home-decoration',
    'furniture',
    'tablets',
    'kitchen-accessories',
    'mens-watches',
  ]
  const curated = products.filter(isCurated)
  const featured = categories.flatMap((c) =>
    curated.find((p) => p.category === c) ? [curated.find((p) => p.category === c)!] : [],
  )
  return (
    <>
      <section className="hero container" aria-labelledby="hero-title">
        <div className="hero__copy">
          <span className="eyebrow">
            <span className="live-dot" />
            OBJETOS QUE FAZEM SENTIDO
          </span>
          <h1 id="hero-title">
            O essencial.
            <br />
            Em uma nova
            <br />
            <em>perspectiva.</em>
          </h1>
          <p>
            Tecnologia que aproxima. Design que inspira.
            <br className="desktop-only" /> Uma seleção para transformar o seu cotidiano.
          </p>
          <div className="hero__buttons">
            <Link className="button button--dark" to="/catalogo">
              Encontre seu próximo favorito
              <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
            <a className="text-link" href="#selecionados">
              Conheça a seleção
              <ArrowDown size={15} aria-hidden="true" />
            </a>
          </div>
          <div className="hero__signature">
            <span className="signature-mark">N.</span>
            <span>
              Menos excesso.
              <br />
              <strong>Mais conexão com você.</strong>
            </span>
          </div>
        </div>
        <div className="hero__visual">
          <div className="hero__visual-top">
            <span>CURADORIA NEXO / 01</span>
            <Sparkles size={21} aria-hidden="true" />
          </div>
          <div className="hero__orbit" />
          <span className="hero__vertical">DESIGN ENCONTRA POSSIBILIDADES</span>
          <img
            src={`${import.meta.env.BASE_URL}assets/hero-laptop.webp`}
            width="640"
            height="640"
            fetchPriority="high"
            alt="Notebook cinza em uma composição editorial NEXO"
          />
          <div className="hero__floating">
            <span>PARA CRIAR SEM LIMITES</span>
            <strong>
              Seu próximo
              <br />
              ponto de partida.
            </strong>
            <Link to="/catalogo?categoria=laptops" aria-label="Explorar notebooks">
              <ArrowUpRight size={22} aria-hidden="true" />
            </Link>
          </div>
          <div className="hero__visual-bottom">
            <span>TECNOLOGIA COM PROPÓSITO</span>
            <span>
              01 <span className="hero__line" /> 04
            </span>
          </div>
        </div>
      </section>
      <section className="benefits-strip container" aria-label="Sua experiência na NEXO">
        <div>
          <Package aria-hidden="true" />
          <span>
            <strong>Seleção sem excessos</strong>O que importa, em um só lugar
          </span>
        </div>
        <div>
          <HeartSymbol />
          <span>
            <strong>Seu jeito de escolher</strong>Salve favoritos e continue depois
          </span>
        </div>
        <div>
          <Leaf aria-hidden="true" />
          <span>
            <strong>Explore com tranquilidade</strong>Checkout demonstrativo, sem cobrança
          </span>
        </div>
      </section>
      <section className="container section-block">
        <div className="section-heading">
          <div>
            <span className="eyebrow">CADA DIA, NOVAS POSSIBILIDADES</span>
            <h2>Qual é a sua conexão?</h2>
          </div>
          <Link className="text-link" to="/catalogo">
            Explore todas
            <ArrowUpRight size={17} aria-hidden="true" />
          </Link>
        </div>
        <div className="category-grid">
          {[
            {
              name: 'Para criar',
              sub: 'Notebooks & possibilidades',
              slug: 'laptops',
              icon: Laptop,
              tone: 'sage',
            },
            {
              name: 'Para conectar',
              sub: 'Smartphones & novos caminhos',
              slug: 'smartphones',
              icon: Smartphone,
              tone: 'peach',
            },
            {
              name: 'Para facilitar',
              sub: 'Acessórios & pequenos detalhes',
              slug: 'mobile-accessories',
              icon: Headphones,
              tone: 'lavender',
            },
            {
              name: 'Para morar',
              sub: 'Casa & um pouco de você',
              slug: 'home-decoration',
              icon: Leaf,
              tone: 'sand',
            },
          ].map((c) => (
            <Link
              key={c.slug}
              className={`category-tile category-tile--${c.tone}`}
              to={`/catalogo?categoria=${c.slug}`}
            >
              <span className="category-tile__icon">
                <c.icon size={30} strokeWidth={1.3} aria-hidden="true" />
              </span>
              <ArrowUpRight size={17} aria-hidden="true" />
              <div>
                <h3>{c.name}</h3>
                <p>{c.sub}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
      <section className="container section-block" id="selecionados">
        <div className="section-heading">
          <div>
            <span className="eyebrow">BOAS ESCOLHAS COMEÇAM AQUI</span>
            <h2>Selecionados para você.</h2>
          </div>
          <Link className="text-link" to="/catalogo">
            Ver catálogo
            <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </div>
        {loading && !products.length ? (
          <SkeletonGrid />
        ) : error ? (
          <ErrorState message={error} onRetry={() => void reload().catch(() => undefined)} />
        ) : (
          <div className="product-grid">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
      <section className="editorial container">
        <div>
          <span className="eyebrow">CASA, COM A SUA PERSONALIDADE</span>
          <h2>
            Os detalhes mudam
            <br />o jeito de viver.
          </h2>
          <p>Um novo olhar para os espaços que fazem parte de você.</p>
          <Link className="button" to="/catalogo?colecao=home">
            Encontre seu detalhe
            <ArrowUpRight size={17} aria-hidden="true" />
          </Link>
        </div>
        <div className="editorial__art" aria-hidden="true">
          <div className="editorial__arch" />
          <span className="editorial__circle" />
          <img
            src={`${import.meta.env.BASE_URL}assets/living.webp`}
            alt=""
            width="400"
            height="400"
            loading="lazy"
          />
        </div>
      </section>
      <section className="closing-note container">
        <span className="eyebrow">ESCOLHA O QUE CONECTA</span>
        <p>
          Mais do que encontrar produtos.
          <br />
          <strong>Encontrar o que combina com você.</strong>
        </p>
        <Link to="/sobre" className="text-link">
          Essa é a NEXO
          <ArrowUpRight size={16} aria-hidden="true" />
        </Link>
      </section>
    </>
  )
}
function HeartSymbol() {
  return (
    <span className="benefit-heart" aria-hidden="true">
      ♡
    </span>
  )
}
