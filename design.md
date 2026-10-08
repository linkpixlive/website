# Design System — LinkPix

## 1. Objetivo

Diretrizes visuais para criar novas páginas do LinkPix mantendo uma identidade consistente, reconhecível e com aparência de produto real.

A referência visual é uma interface SaaS moderna, editorial e minimalista, com bastante respiro, tipografia forte, superfícies bem definidas e uso intencional de cor.

**Não transformar toda página em uma coleção de cards.** A composição deve ser definida pelo conteúdo e pela função da página.

## 2. Princípios

### Conteúdo antes da decoração

Priorizar:

1. hierarquia da informação;
2. clareza das ações;
3. leitura rápida;
4. agrupamento lógico;
5. consistência.

Evitar elementos decorativos sem função.

### Anti-AI-slop

Evitar:

- excesso de cards independentes;
- repetição de `ícone + título + descrição`;
- excesso de badges;
- gradientes decorativos;
- sombras exageradas;
- glassmorphism sem função;
- elementos flutuantes aleatórios;
- grandes números usados apenas para preencher espaço;
- bento grid como solução padrão.

A interface deve parecer desenhada para aquela funcionalidade específica.

### Uma ideia visual dominante por página

Exemplos:

- carteira → saldo + saque + histórico;
- doações → fila de alertas + histórico + controles;
- integrações → conexões + configuração;
- landing page → proposta de valor + demonstração + funcionalidades + como funciona + FAQ + CTA.

## 3. Identidade visual

### Cor de marca

A cor principal é **azul**.

Usar o azul principalmente em:

- CTAs primários;
- links;
- estados ativos;
- elementos de destaque;
- indicadores importantes.

Não transformar toda a interface em azul. A maior parte deve usar neutros.

### Cores semânticas

- verde → sucesso/concluído;
- amarelo/âmbar → pendente/atenção;
- vermelho → erro/perigo;
- azul → ação, informação ou identidade.

Cores semânticas não devem ser usadas apenas como decoração.

## 4. Tipografia

A tipografia deve criar uma hierarquia forte e simples.

**Títulos:** grandes, pesados, curtos e de alto contraste.

**Subtítulos:** menores e usados para contextualizar.

**Corpo:** confortável para leitura e com contraste suficiente.

**Valores financeiros:** podem receber destaque tipográfico significativo quando forem a informação principal.

## 5. Layout

Usar uma área principal centralizada, com largura máxima adequada para desktop e bastante respiro.

Evitar:

- conteúdo espremido;
- excesso de colunas;
- margens inconsistentes;
- componentes ocupando espaço sem necessidade.

### Grid

Grid deve organizar relações entre conteúdos, não preencher espaço.

Uma página pode misturar:

- bloco principal;
- coluna secundária;
- lista;
- tabela;
- seção de destaque;
- área livre.

A composição não precisa ser simétrica.

### Bento grid

Bento grid é permitido, mas não obrigatório.

Usar quando diferentes funcionalidades independentes realmente se beneficiam de uma composição modular.

Para páginas transacionais, preferir estruturas mais claras, como listas e tabelas, quando forem mais adequadas.

## 6. Cards e superfícies

Um card deve representar uma unidade real de informação ou interação.

Exemplos adequados:

- saldo disponível;
- chaves Pix;
- status da conta;
- funcionalidade independente;
- demonstração de produto.

Evitar repetir `ícone + título + descrição` apenas para preencher uma grade.

Nem todo conteúdo precisa estar dentro de uma caixa.

### Superfícies

Usar níveis de superfície para criar hierarquia:

- página;
- seção;
- bloco principal;
- elemento interativo.

### Bordas

Preferir bordas discretas e consistentes.

Elementos maiores podem ter raio maior que controles pequenos.

## 7. Dashboard

A interface autenticada deve priorizar produtividade.

Estrutura geral:

- navegação;
- cabeçalho da página;
- conteúdo principal;
- ações relevantes;
- dados e histórico.

### Desktop

Usar sidebar persistente.

### Mobile

Adaptar a navegação ao espaço disponível. Não simplesmente reduzir o desktop até caber.

## 8. Páginas financeiras

Devem transmitir:

- confiança;
- precisão;
- estabilidade;
- clareza;
- controle.

Evitar visual excessivamente lúdico.

### Carteira

Hierarquia recomendada:

1. saldo disponível;
2. ação de saque;
3. valores pendentes/bloqueados;
4. chaves Pix;
5. histórico de saques.

O saldo deve ser o principal elemento visual.

O histórico deve priorizar leitura e comparação, usando tabela ou lista estruturada quando apropriado.

**Não transformar cada saque em um grande card colorido.**

### Doações

Priorizar:

- visualizar fila;
- pausar;
- pular alerta;
- testar alerta;
- repetir;
- ouvir áudio;
- consultar histórico;
- filtrar.

A interface deve favorecer operação rápida e alta densidade de informação.

## 9. Landing page

A landing page deve apresentar o produto, e não simplesmente reproduzir o dashboard.

### Hero

Pode utilizar texto centralizado.

Estrutura:

- eyebrow/contexto;
- título forte;
- descrição curta;
- CTA principal;
- CTA secundário opcional;
- demonstração visual real do produto.

Deve comunicar rapidamente:

**o que é + para quem é + por que é útil.**

### Demonstração

Preferir exemplos reais do produto:

- dashboard;
- fila de doações;
- alerta;
- pagamento;
- mensagem recebida;
- configuração.

Evitar mockups genéricos que poderiam representar qualquer SaaS.

### Funcionalidades

As funcionalidades devem ser apresentadas por exemplos concretos de uso.

Bento grid pode ser usado aqui.

Exemplos:

- uma doação chegando;
- alerta de áudio sendo reproduzido;
- regras sendo configuradas;
- histórico de pagamentos;
- integração com OBS.

Evitar uma grade formada apenas por ícones e descrições.

### Como funciona

Mostrar o fluxo real em poucos passos.

Exemplo:

1. crie sua conta;
2. conecte seu Pix;
3. configure os alertas;
4. receba sua primeira doação.

### FAQ

Usar estrutura simples e escaneável.

### CTA final

Reforçar a ação principal sem criar uma nova linguagem visual.

## 10. Estados

Componentes devem considerar:

- default;
- hover;
- focus;
- active;
- disabled;
- loading;
- success;
- warning;
- error.

Não depender exclusivamente de cor para comunicar estados.

## 11. Dark mode

O dark mode não deve ser uma simples inversão das cores.

Adaptar:

- fundo;
- superfícies;
- bordas;
- contraste;
- texto;
- cores semânticas;
- azul de marca.

Evitar preto puro em toda a interface.

Usar diferentes níveis de superfícies escuras para preservar a hierarquia.

A composição e a hierarquia do light mode devem continuar reconhecíveis.

## 12. Responsividade

Projetar a hierarquia antes de adaptar o layout.

### Desktop

Permitir sidebar, múltiplas colunas, áreas de apoio, tabelas e demonstrações maiores.

### Tablet

Reduzir colunas e priorizar o conteúdo principal.

### Mobile

Priorizar:

1. informação principal;
2. ação principal;
3. conteúdo essencial;
4. conteúdo secundário.

Não simplesmente reduzir todos os componentes proporcionalmente.

## 13. Regras para gerar novas páginas com IA

Ao criar uma nova página:

1. entender a função;
2. identificar a informação mais importante;
3. definir a hierarquia;
4. escolher a composição;
5. escolher componentes;
6. aplicar a identidade visual;
7. revisar espaçamento e alinhamento;
8. revisar responsividade;
9. revisar dark mode;
10. eliminar elementos decorativos sem função.

A IA deve preservar a linguagem visual do sistema, mas não repetir mecanicamente a mesma estrutura.

Uma nova página pode ter composição diferente quando isso melhorar a experiência.

## 14. Checklist anti-slop

- [ ] A hierarquia é clara?
- [ ] O elemento mais importante recebe maior destaque?
- [ ] Cada card possui uma razão real para existir?
- [ ] Existem cards que poderiam ser conteúdo normal?
- [ ] Existe repetição excessiva de `ícone + título + descrição`?
- [ ] O bento grid realmente melhora a apresentação?
- [ ] As cores possuem função?
- [ ] Há elementos decorativos sem propósito?
- [ ] A página parece específica para o LinkPix?
- [ ] A composição funciona sem depender de efeitos visuais?
- [ ] O layout funciona em telas menores?
- [ ] O dark mode preserva a hierarquia?
- [ ] As ações principais são imediatamente identificáveis?
- [ ] O resultado parece uma interface de produto real, e não uma coleção de componentes de demonstração?

## 15. Regra final

**Não existe uma estrutura obrigatória para todas as páginas.**

O que deve ser consistente:

- identidade visual;
- tipografia;
- espaçamento;
- tratamento de superfícies;
- cores;
- componentes;
- estados;
- responsividade;
- simplicidade;
- hierarquia.

A composição deve mudar de acordo com o conteúdo.

**Consistência não significa repetição.**

## 16. Tokens normativos (extraídos do protótipo `/novo`)

Valores exatos. Componentes usam os tokens semânticos (`app/app.css @theme`),
nunca estes hex literais — exceto o `/novo`, que é protótipo isolado de arquivo
único e referência visual desta tabela.

### Light

| Token | Hex | Uso |
|---|---|---|
| Canvas / wash / ninho | `#FBF8EF` | fundo da página e preenchimentos aninhados |
| Card | `#FFFFFF` | superfícies |
| Rail / shell | `#111111` | navegação (fixo nos dois temas) |
| Borda hairline | `#E8E4DB` | divisórias e molduras quietas |
| Borda de controle | `#9A8B6F` (dark `#8C8271`) | inputs, selects, datas, OTP, anéis de rádio — ≥3:1 (WCAG 1.4.11) |
| Tinta título / forte | `#111111` | headings, valores, ênfases |
| Tinta corpo | `#6B6558` | parágrafos, secundário |
| Tinta muda | `#8F887C` | meta, labels, ícones idle do rail |
| Marca azul | `#AEC6E8` | item ativo, logo, avatar, dot |
| CTA amarelo | `#F5D85D` | só ação primária e badge pendente |
| Info | `#2B4B7A` (fundo `#DCE8FA`, dot `#5B8DEF`) | links, processando |
| Success | `#4C5E27` (fundo `#DDE6C3`, dot `#7A9150`) | concluído, confirmações |
| Error | `#A02A2A` (fundo `#FAD9D9`) | perigo, falhas |
| Warning | `#D9A400` | dot pendente |

Sólidos com texto branco (`error-solid`, `success-solid`) não mudam no dark.

### Dark (sem inversão mecânica)

Fundo `#1D1913`, superfície `#292420`, borda `#3B342A`, textos
`#F6F5EE` / `#B7AB97` / `#8C8271`, hero `#0C0A07`. Marca azul `#AEC6E8`
inalterada. Badges com fundo escuro e texto claro da mesma família
(`#2A3A55`/`#AEC6E8`, `#333D24`/`#C2D197`, `#472425`/`#F0A6A6`). Botão
primário escuro vira claro (`#F6F5EE` + tinta `#111111`).

### Raios

Card/seção/modal `28px`, linha `rounded-2xl`, tile `rounded-xl`, resto pill
`rounded-full`. Card sem sombra. Shell desktop com `rounded-l-[24px]` ("pontas")
e scroll interno (shell travado).

### Regra de fills (interativo × leitura)

`wash` é tinta de ninho, só para leitura: badges, tiles, contadores, resumos.
Elemento interativo (input, select, textarea, OTP, trigger de data) usa o fundo
do pai + `border-line-input` — a borda define o controle, não o preenchimento.
Opções selecionáveis em lista usam divisória (`divide-line`), não uma caixa por
item: nem todo conteúdo precisa estar dentro de uma caixa.
Divisórias de lista recuam (`divide-line/60`); bordas de controle ficam
sempre a 100% — duas gramaturas distintas para o olho não misturar linha de
lista com borda de campo. Hairlines nunca escurecem para "compensar": se a
compreensão depende de enxergar a divisória, o layout está errado — usa-se
respiro + tipografia.
