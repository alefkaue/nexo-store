import { Link } from 'react-router-dom'
import { ArrowUpRight, Code2, Heart, ShieldCheck } from 'lucide-react'
import { usePageMeta } from '../hooks/usePageMeta'
export default function About() {
  usePageMeta(
    'A NEXO',
    'Conheça a proposta da NEXO Store: uma experiência de e-commerce demonstrativa com tecnologia, design e privacidade.',
  )
  return (
    <article className="container about-page">
      <span className="eyebrow">O QUE NOS CONECTA</span>
      <h1>
        Design para escolher.
        <br />
        Tecnologia para conectar.
      </h1>
      <p className="about-intro">
        A NEXO é uma loja demonstrativa criada para explorar como uma boa interface pode tornar a
        jornada de compra mais clara, agradável e acessível.
      </p>
      <div className="about-values">
        <section>
          <Heart aria-hidden="true" />
          <h2>Uma curadoria com intenção.</h2>
          <p>
            Tecnologia, casa e os detalhes do cotidiano. Organizamos os produtos para que explorar
            seja tão simples quanto escolher.
          </p>
        </section>
        <section>
          <Code2 aria-hidden="true" />
          <h2>Uma experiência de verdade.</h2>
          <p>
            Pesquisa, filtros, favoritos, carrinho e validação. Cada interação tem uma função — até
            a confirmação de uma compra que é só uma simulação.
          </p>
        </section>
        <section>
          <ShieldCheck aria-hidden="true" />
          <h2>Privacidade desde o início.</h2>
          <p>
            Você não precisa se cadastrar. Nenhum dado de pagamento é solicitado, e o formulário não
            envia informações para um servidor.
          </p>
        </section>
      </div>
      <section id="como-funciona" className="about-copy">
        <h2>Como funciona?</h2>
        <details open>
          <summary>A NEXO é uma loja real?</summary>
          <p>
            É um projeto de portfólio. Os produtos são fornecidos pela API pública DummyJSON e os
            valores são usados como preços fictícios em reais, sem conversão cambial. Nenhum pedido,
            pagamento ou entrega é realizado.
          </p>
        </details>
        <details>
          <summary>O que acontece no checkout?</summary>
          <p>
            Use apenas apelido, e-mail e cidade fictícios. A validação ocorre no navegador.
            Consultamos novamente preços e estoque da API, descartamos o formulário e mostramos uma
            confirmação demonstrativa. Nenhum dado do formulário é enviado à API.
          </p>
        </details>
        <details>
          <summary>Como o frete é calculado?</summary>
          <p>
            Regra fictícia da experiência: R$ 19,90 em pedidos abaixo de R$ 299 e gratuito a partir
            desse valor. A retirada demonstrativa sempre é gratuita. Não existem envio ou retirada
            de verdade.
          </p>
        </details>
        <details>
          <summary>Os nomes e descrições estão em inglês?</summary>
          <p>
            Os nomes e descrições dos produtos preservam os dados originais da DummyJSON. A
            navegação e as categorias da loja estão em português.
          </p>
        </details>
      </section>
      <section id="privacidade" className="about-copy">
        <h2>Seu navegador, suas escolhas.</h2>
        <p>
          Usamos localStorage para guardar apenas IDs de favoritos e IDs/quantidades do carrinho.
          Não salvamos apelido, e-mail, cidade ou dados de pagamento. Você pode remover suas
          escolhas pela interface ou limpar o armazenamento do site no navegador.
        </p>
        <p>
          O navegador consulta DummyJSON e carrega imagens do catálogo em cdn.dummyjson.com; esses
          serviços externos recebem os dados normais da conexão, como IP. Não adicionamos analytics,
          rastreadores de marketing ou cookies de publicidade.
        </p>
        <p>
          As imagens e os nomes comerciais pertencem aos seus respectivos titulares e são usados
          nesta demonstração com os dados de exemplo da API.
        </p>
      </section>
      <Link className="button" to="/catalogo">
        Conheça a seleção
        <ArrowUpRight size={17} aria-hidden="true" />
      </Link>
    </article>
  )
}
