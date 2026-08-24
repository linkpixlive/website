# 01: Fundação de testes do frontend

**What to build:** O projeto ganha sua primeira infraestrutura de testes automatizados. Um teste de fumaça renderiza a página de Conta dentro de um roteador em memória e verifica que ela aparece na tela, com a camada de rede interceptada por handlers MSW falando o envelope real de respostas do backend (`{success, data}` / `{success:false, error}`). A partir deste ticket, qualquer fatia seguinte já nasce com testes.

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [ ] vitest + jsdom + @testing-library/react + msw instalados como devDependencies
- [ ] Script `test` disponível no gerenciador de scripts do projeto
- [ ] Configuração de testes cobre JSX, aliasing de import igual ao da app e ambiente jsdom
- [ ] Handlers MSW centrais falando o envelope padrão da API, prontos para estender por domínio
- [ ] Teste de fumaça: a rota Conta renderiza o cabeçalho esperado sem erros de rede não tratados
- [ ] Suíte existente (typecheck) continua passando
