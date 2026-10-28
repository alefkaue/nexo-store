# Verificação local — 28/10/2026

Ambiente: Windows, Node 24.19.0, npm 11.17.0, Chromium do Playwright 1.64.1.

| Verificação executada         | Resultado                                                                 |
| ----------------------------- | ------------------------------------------------------------------------- |
| TypeScript strict             | Aprovado                                                                  |
| ESLint, sem warnings          | Aprovado                                                                  |
| Prettier                      | Aprovado                                                                  |
| Vitest / Testing Library      | 47 testes, 6 arquivos, aprovados                                          |
| Playwright                    | 28 execuções aprovadas; 14 cenários em desktop e mobile                   |
| Axe no Playwright             | Nenhuma violação nas regras selecionadas nas cinco páginas de compra      |
| Smoke com API real            | Home, detalhe, carrinho, checkout e favoritos aprovados nos dois tamanhos |
| Capturas reais                | Desktop 1440 × 1080; mobile 390 × 844                                     |
| npm audit                     | Nenhuma vulnerabilidade reportada no momento da verificação               |
| Build Vite                    | Aprovado                                                                  |
| Busca por padrões de segredos | Nenhuma ocorrência nos arquivos destinados ao repositório                 |

Cobertura V8 de **domínio, serviço HTTP e persistência**: 96,68% de statements, 93,36% de branches, 97,67% de funções e 99,21% de linhas. Os componentes e páginas não estão incluídos nesse percentual.

O smoke real verificou ainda ausência de erros JavaScript, ausência de requisições POST/PUT/PATCH/DELETE, carrinho vazio após confirmação, favoritos preservados, fonte local carregada e ausência de rolagem horizontal nas telas percorridas. Ele não cria compras ou pedidos externos.

E2E determinístico e integração real são verificações diferentes. As fixtures permitem simular indisponibilidade, falta de rede e alterações de estoque sem depender de uma falha no serviço público. A aplicação e as capturas documentadas usam o serviço real.

Para o estado atual do CI e das publicações, consulte o [workflow no GitHub](https://github.com/alefkaue/nexo-store/actions/workflows/quality-pages.yml). Resultados locais não substituem a verificação do deploy.

Não foram executados testes em aparelho físico, Safari ou Firefox, auditoria de leitor de tela nem auditoria Lighthouse. Não há alegação de conformidade WCAG completa ou de backend comercial pronto.
