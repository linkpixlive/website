# 02: Estado real da conta na página Conta

**What to build:** Ao abrir a página Conta, o streamer vê os dados reais da sua conta vindos do módulo account-settings do backend: o e-mail aparece mascarado numa nova linha do card Segurança, o selo da autenticação em dois fatores reflete o estado verdadeiro (Ativa/Inativa) e a linha inventada "Sessões ativas" desaparece. Este ticket cria também o módulo de API do domínio completo — todas as operações tipadas seguindo o padrão das demais integrações, com tipos preferencialmente gerados do schema OpenAPI e fallback manual aceito se o backend não estiver rodando.

**Blocked by:** 01 (Fundação de testes do frontend).

**Status:** ready-for-agent

- [ ] Módulo de API do domínio expõe: obter configurações, alterar senha, alterar e-mail, desativar conta, setup/ativar/desativar 2FA — todos via cliente autenticado padrão com envelope de resposta
- [ ] Módulo exportado no índice compartilhado da camada de API
- [ ] Loader da rota busca as configurações com o token do cookie e aplica fallbacks seguros em caso de falha
- [ ] Linha "E-mail" no card Segurança exibindo o endereço mascarado retornado pelo backend
- [ ] Selo 2FA dirigido pelo campo `has2fa` (verde quando ativa, neutro quando inativa)
- [ ] Linha "Sessões ativas" removida
- [ ] Testes MSW: mapeamento do loader, estados do selo, comportamento em falha de rede
