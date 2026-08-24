# 08: Preferências locais persistentes

**What to build:** Os switches de "Alertas sonoros" e "Modo compacto" deixam de ser decorativos: viram controles interativos cujo estado é salvo no dispositivo e restaurado em visitas seguintes, sem nenhum contrato com o backend. Inicialização preguiçosa no cliente evita divergência de hidratação.

**Blocked by:** 01 (Fundação de testes).

**Status:** ready-for-agent

- [ ] Switches controlados por estado real do componente
- [ ] Persistência em localStorage com chaves estáveis do domínio conta
- [ ] Estado restaurado entre recargas; sem mismatch de hidratação SSR
- [ ] Testes: alternar persiste, recarregar restaura
