# Segurança e escopo

Este é um front-end demonstrativo público. Não informe dados reais no checkout. Não há pagamentos, contas ou pedidos persistidos em servidor.

- Dados externos são validados em runtime e renderizados como texto React, sem HTML arbitrário.
- O checkout não transmite o formulário; apenas consulta o catálogo por GET.
- localStorage guarda exclusivamente IDs de produtos e quantidades, com limites e versão de schema.
- A restauração de URLs do Pages permite somente caminhos locais e rejeita barras invertidas, controles e URLs com `//`.
- Dependências e Actions são fixadas; o CI executa `npm audit --audit-level=high`.
- A aplicação depende da disponibilidade e política de acesso da DummyJSON e do hosting estático.

Não publique credenciais ou dados pessoais em issues. Para um problema sem informação sensível, abra uma issue com reprodução local e comportamento esperado. Essas medidas não substituem a segurança de backend necessária em um e-commerce comercial.
