-- =============================================
-- Fluxo Operacional - DROP SCRIPT
-- Remove todos os objetos criados pelo database_schema.sql
-- Todos os componentes têm prefixo flop_
-- =============================================

-- ATENÇÃO: Este script irá EXCLUIR TODOS OS DADOS!
-- Execute apenas se tiver certeza.

-- =============================================
-- 1. Remover Policies (RLS)
-- =============================================
DROP POLICY IF EXISTS flop_policy_notas ON flop_notas;
DROP POLICY IF EXISTS flop_policy_tarefas ON flop_tarefas;
DROP POLICY IF EXISTS flop_policy_objetivos ON flop_objetivos;
DROP POLICY IF EXISTS flop_policy_projetos ON flop_projetos;
DROP POLICY IF EXISTS flop_policy_frentes ON flop_frentes_estrategicas;
DROP POLICY IF EXISTS flop_policy_responsaveis ON flop_responsaveis;

-- =============================================
-- 2. Remover Triggers
-- =============================================
-- Triggers de updated_at
DROP TRIGGER IF EXISTS flop_trigger_responsaveis_updated_at ON flop_responsaveis;
DROP TRIGGER IF EXISTS flop_trigger_frentes_updated_at ON flop_frentes_estrategicas;
DROP TRIGGER IF EXISTS flop_trigger_projetos_updated_at ON flop_projetos;
DROP TRIGGER IF EXISTS flop_trigger_objetivos_updated_at ON flop_objetivos;
DROP TRIGGER IF EXISTS flop_trigger_tarefas_updated_at ON flop_tarefas;

-- Triggers de código automático
DROP TRIGGER IF EXISTS flop_trigger_frente_codigo ON flop_frentes_estrategicas;
DROP TRIGGER IF EXISTS flop_trigger_projeto_codigo ON flop_projetos;
DROP TRIGGER IF EXISTS flop_trigger_objetivo_codigo ON flop_objetivos;
DROP TRIGGER IF EXISTS flop_trigger_tarefa_codigo ON flop_tarefas;

-- =============================================
-- 3. Remover Functions
-- =============================================
DROP FUNCTION IF EXISTS flop_update_updated_at();
DROP FUNCTION IF EXISTS flop_generate_frente_codigo();
DROP FUNCTION IF EXISTS flop_generate_projeto_codigo();
DROP FUNCTION IF EXISTS flop_generate_objetivo_codigo();
DROP FUNCTION IF EXISTS flop_generate_tarefa_codigo();

-- =============================================
-- 4. Remover Indexes
-- =============================================
DROP INDEX IF EXISTS flop_idx_projetos_frente;
DROP INDEX IF EXISTS flop_idx_objetivos_projeto;
DROP INDEX IF EXISTS flop_idx_objetivos_parent;
DROP INDEX IF EXISTS flop_idx_tarefas_objetivo;
DROP INDEX IF EXISTS flop_idx_notas_tarefa;

-- =============================================
-- 5. Remover Tabelas (ordem inversa de dependência)
-- =============================================
DROP TABLE IF EXISTS flop_notas CASCADE;
DROP TABLE IF EXISTS flop_tarefas CASCADE;
DROP TABLE IF EXISTS flop_objetivos CASCADE;
DROP TABLE IF EXISTS flop_projetos CASCADE;
DROP TABLE IF EXISTS flop_frentes_estrategicas CASCADE;
DROP TABLE IF EXISTS flop_responsaveis CASCADE;

-- =============================================
-- Pronto! Todos os objetos flop_* foram removidos.
-- =============================================
