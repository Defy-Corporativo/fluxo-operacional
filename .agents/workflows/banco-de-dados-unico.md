---
description: Regras de governança do banco de dados unificado do portfólio corporativo
---

# Banco de Dados Único — Regras de Governança

## Contexto

Este projeto faz parte de um portfólio corporativo que compartilha um **único banco de dados Supabase**. Cada aplicação é dona de um conjunto de tabelas identificadas por um prefixo.

## Prefixos de Domínio

| Prefixo | Aplicação             | Descrição                              |
|---------|-----------------------|----------------------------------------|
| `fcst_` | forecast-comercial    | Oportunidades, clientes, pipeline      |
| `flop_` | fluxo-operacional     | Projetos, objetivos, tarefas           |
| `prtc_` | portal-corporativo    | Portais, perfis corporativos           |
| `pepl_` | gestao-pessoal        | Responsáveis, dados de pessoas         |

## Este Projeto: `fluxo-operacional` (prefixo `flop_`)

### Permissões

- ✅ **LEITURA (SELECT)**: Pode consultar **qualquer tabela** do banco, de qualquer prefixo.
- ✅ **ESCRITA (INSERT/UPDATE/DELETE)**: Permitida **apenas** em tabelas com prefixo `flop_`.
- ❌ **PROIBIDO**: Fazer INSERT, UPDATE ou DELETE em tabelas `fcst_`, `prtc_` ou `pepl_`.

### Schema deste projeto

O arquivo `supabase/database_schema.sql` contém **somente** as tabelas `flop_` deste projeto.

### Referência completa

Consulte `supabase/database-unico/GOVERNANCA.md` para o documento completo de governança.
Consulte `supabase/database-unico/schema-unico.sql` para ver todas as tabelas do banco unificado.
