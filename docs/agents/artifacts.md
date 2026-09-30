# Artefatos de trabalho de agentes

Convenção canônica de onde salvar planos, specs e relatórios gerados por IA — mesmo padrão do backend. Cache de ferramenta (`.opencode/`, `.worktrees/`) é transitório, nunca destino final.

## Mapa

| Artefato | Destino | Nome |
|---|---|---|
| Plano de implementação | `docs/plans/` | `YYYY-MM-DD-<slug>.md` |
| Spec de feature/design | `docs/specs/` | `YYYY-MM-DD-<slug>.md` |
| Registro de decisão (ADR) | `docs/adr/` | `NNNN-<slug>.md` |
| Auditoria/relatório | `docs/audits/` | `YYYY-MM-DD-<slug>.md` |

## Regras

- Slug em kebab-case, coerente com o conteúdo.
- Proibido destino ad-hoc (`docs/analise-*.md`, `ai-docs/` etc.).
- Concluído não é apagado — vira histórico.
