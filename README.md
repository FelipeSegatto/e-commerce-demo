# Gift Store

Demo navegável de uma loja de presentes em **Next.js 16, React 19, TypeScript e Tailwind CSS 4**. Marca Gift Store fictícia; nomes de produtos e fotografias fornecidos pelo usuário, com preços e estoques demonstrativos. As fotografias de presentes foram reutilizadas da referência com autorização; a arte ilustrada é local.

## Executar

Use Node.js 24 e npm 11 (ambiente validado).

```bash
npm ci
npm run dev -- --hostname 0.0.0.0
```

Para produção:

```bash
npm run build
npm run start -- --hostname 0.0.0.0
```

No ambiente cloud, use `NPM_CONFIG_CACHE=/workspace/.npm-cache` se o diretório padrão de cache não for gravável. Nenhum segredo, banco de dados ou serviço externo é necessário.

## O que explorar

- Loja: início com banner de ofertas, mega menu por coleção/ocasião/preço, catálogo com busca/categorias/ocasiões/faixa de preço/ofertas/personalização/disponibilidade, ordenação, filtros removíveis, favoritos, detalhes, opções e cartão personalizado, sacola, cupom `GIFT10`, checkout em cinco etapas e confirmação. Botões e cards têm transições de hover/foco, respeitando a preferência de movimento reduzido.
- Cliente: entrada/cadastro demonstrativos, pedidos com detalhes e status, nome do perfil e formulário de endereço.
- Vendedor: catálogo, criação de proposta, desconto, aprovação e oferta local. Descontos de até 10% são aprovados automaticamente; acima disso passam pelo administrador.
- Administrador: indicadores, produtos e cadastro, ajuste de estoque, pedidos e atualização de status, resumo financeiro, equipe e aprovação de descontos.
- Institucional: sobre, contato simulado, entrega/trocas/privacidade.

Use o seletor fixo **Explorar demo**, no canto inferior, como ponto único de troca entre Loja, Administrador e Vendedor. Ele identifica o modo atual, descreve cada perspectiva e permite reiniciar os dados. Fecha por Escape ou clique fora e funciona por teclado e toque. Os painéis podem ser acessados diretamente em `/admin` e `/vendedor`, sem login real. Para testar o fluxo assistido: crie uma proposta no vendedor, aprove o desconto no administrador se necessário, abra a oferta e conclua o checkout. A proposta será convertida, o pedido aparecerá no painel e o estoque será reduzido.

## Limites da demonstração

Não há autenticação real, autorização, envio de mensagens, pagamento, cálculo logístico ou backend. Não use dados pessoais nem senhas reais. Estado persistente: catálogo/estoque, sacola, favoritos, pedidos, propostas e nome do perfil em `localStorage` (`gift-store-demo-v1`). Endereços e novos integrantes de equipe são exemplos mantidos somente na sessão da respectiva página. Ofertas locais não são compartilháveis entre dispositivos. Preços, prazos e frete são exemplos, não regras comerciais definitivas.

## Estrutura e integração futura

- `src/app`: páginas e roteamento do App Router, layout e 404.
- `src/components`: componentes interativos, experiência da loja, painéis e provider da demo.
- `src/domain/types.ts`: contratos de produto, item de sacola, pedido e proposta.
- `src/services/catalog.ts`: catálogo fictício e adapter de leitura (`catalogService`).
- `src/services/demo.ts`: persistência local, defaults e reset.
- `public/photos` e `public/illustrations`: imagens servidas localmente; não dependem do site de referência em runtime.

Para integrar backend, substitua a persistência local por um provider que consuma os contratos de domínio e implemente o adapter de catálogo. Mova preço/desconto, estoque, aprovação de propostas e criação de pedidos para validação no servidor; as regras atuais são somente demonstrativas no cliente. Separe autenticação/permissões, gateway de pagamento, logística e atendimento. `localStorage` nunca deve servir como fonte confiável de pedidos ou permissões em produção.

## Validação

```bash
npm run lint
npm run typecheck
npm run test:domain
npm run build
```

Com a aplicação em execução, rode o smoke test de navegador:

```bash
# Cloud: Chromium já disponível
CHROMIUM_PATH=/usr/bin/chromium npm run test:smoke
CHROMIUM_PATH=/usr/bin/chromium npm run test:discovery

# Em outra máquina, instale o navegador uma vez
npx playwright install chromium
npm run test:smoke
```

O teste usa contextos isolados de navegador e exercita mega menu por hover/teclado/toque, filtros combinados e reset, banner de ofertas, animação e adição rápida à sacola, links de admin/vendedor, layout em 320px e seleção obrigatória de opções, personalização, cupom, checkout, persistência, atualização de pedido, aprovação e conversão de proposta, estoque, favoritos, cadastro de produto, navegação e imagens em 23 rotas mobile, ausência de erros de runtime e 404. `DEMO_BASE_URL` permite testar outra porta; `SMOKE_SCREENSHOT_DIR` define onde salvar as capturas (diretório deve existir).

## Ambiente cloud

Use o checkout existente `/workspace/e-commerce-demo`. Não crie worktrees: cada tarefa cloud já é isolada. Dependências e build são reproduzíveis com `npm ci`; processos devem ser iniciados novamente em novas tarefas. As instruções de instalação e inicialização são salvas separadamente na configuração do ambiente; publicação é feita na interface do produto.

## Catálogo e descoberta

93 produtos em 8 categorias, com fotos locais JPG e WebP. Os arquivos duplicados enviados permanecem preservados, sem criar produtos repetidos. A seleção inclui perfumes, chocolates, banho e cuidados, aromas, decoração, flores, festas e cestas. Valores e estoques são demonstrativos.

A busca aceita palavras sem acentos e sugere produtos por nome, marca e ocasião. Os filtros combinam preço, categoria, tipo, marca, ocasião, cor, material, disponibilidade, ofertas e personalização. URL preserva filtros, ordenação e paginação. `/presentear` recomenda seleções por ocasião e orçamento; `/cupons` reúne seis campanhas por tema.

Cupons aplicam desconto somente nos produtos elegíveis, respeitam valor mínimo e limite de desconto, excluem o frete e não acumulam com propostas de vendedor. GIFT10 vale apenas para o primeiro pedido neste navegador. Checkout registra código e desconto no pedido.

Novos catálogos migram o estado local preservando estoque existente, pedidos, favoritos, sacola e produtos cadastrados. Fotos e variantes estão vinculadas em `src/data/catalog-images.json`; `src/data/image-import-manifest.json` documenta cada vínculo.

## Vitrines da home

A home apresenta 24 produtos em quatro formatos: seleção principal com oito cards, composição editorial para casa com quatro peças, uma prateleira de seis presentes até R$ 75 e outra com seis itens de autocuidado. Fotos de todos os banners são distintas. As prateleiras permitem navegar por rolagem, teclado, toque e botões direcionais. Os links abrem detalhes dos produtos ou o catálogo com os filtros da coleção.

`CHROMIUM_PATH=/usr/bin/chromium npm run test:home` verifica a curadoria, imagens distintas, prateleiras, troca de modos, fechamento do seletor e layouts em 320, 390 e 768 pixels.
