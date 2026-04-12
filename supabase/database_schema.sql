-- =============================================
-- Fluxo Operacional - Database Schema
-- Prefixo flop_ em TODOS os componentes
-- =============================================
-- SCRIPT PARA RECRIAR O BANCO DE DADOS
-- Este script contém tanto DROP quanto CREATE statements
-- Pode ser executado para recriar todo o schema do zero
--
-- ATENÇÃO: Executar este script irá APAGAR todos os dados!
-- =============================================

-- =============================================
-- PARTE 0: DROP de todos os objetos (ordem inversa)
-- =============================================

-- Remover Policies (RLS)
DROP POLICY IF EXISTS flop_policy_notas ON flop_notas;
DROP POLICY IF EXISTS flop_policy_tarefas ON flop_tarefas;
DROP POLICY IF EXISTS flop_policy_objetivos ON flop_objetivos;
DROP POLICY IF EXISTS flop_policy_projetos ON flop_projetos;
DROP POLICY IF EXISTS flop_policy_frentes ON flop_frentes_estrategicas;
DROP POLICY IF EXISTS flop_policy_responsaveis ON flop_responsaveis;

-- Remover Triggers
DROP TRIGGER IF EXISTS flop_trigger_responsaveis_updated_at ON flop_responsaveis;
DROP TRIGGER IF EXISTS flop_trigger_frentes_updated_at ON flop_frentes_estrategicas;
DROP TRIGGER IF EXISTS flop_trigger_projetos_updated_at ON flop_projetos;
DROP TRIGGER IF EXISTS flop_trigger_objetivos_updated_at ON flop_objetivos;
DROP TRIGGER IF EXISTS flop_trigger_tarefas_updated_at ON flop_tarefas;
DROP TRIGGER IF EXISTS flop_trigger_frente_codigo ON flop_frentes_estrategicas;
DROP TRIGGER IF EXISTS flop_trigger_projeto_codigo ON flop_projetos;
DROP TRIGGER IF EXISTS flop_trigger_objetivo_codigo ON flop_objetivos;
DROP TRIGGER IF EXISTS flop_trigger_tarefa_codigo ON flop_tarefas;

-- Remover Functions
DROP FUNCTION IF EXISTS flop_update_updated_at();
DROP FUNCTION IF EXISTS flop_generate_frente_codigo();
DROP FUNCTION IF EXISTS flop_generate_projeto_codigo();
DROP FUNCTION IF EXISTS flop_generate_objetivo_codigo();
DROP FUNCTION IF EXISTS flop_generate_tarefa_codigo();

-- Remover Indexes
DROP INDEX IF EXISTS flop_idx_projetos_frente;
DROP INDEX IF EXISTS flop_idx_objetivos_projeto;
DROP INDEX IF EXISTS flop_idx_objetivos_parent;
DROP INDEX IF EXISTS flop_idx_tarefas_objetivo;
DROP INDEX IF EXISTS flop_idx_notas_tarefa;

-- Remover Tabelas (ordem inversa de dependência)
DROP TABLE IF EXISTS flop_notas CASCADE;
DROP TABLE IF EXISTS flop_tarefas CASCADE;
DROP TABLE IF EXISTS flop_objetivos CASCADE;
DROP TABLE IF EXISTS flop_projetos CASCADE;
DROP TABLE IF EXISTS flop_frentes_estrategicas CASCADE;
DROP TABLE IF EXISTS flop_responsaveis CASCADE;

-- =============================================
-- PARTE 1: CRIAÇÃO
-- =============================================

-- Habilitar extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- Tabela: Responsáveis (apenas nome)
-- =============================================
CREATE TABLE IF NOT EXISTS flop_responsaveis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- Tabela: Frentes Estratégicas
-- =============================================
CREATE TABLE IF NOT EXISTS flop_frentes_estrategicas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(10) NOT NULL UNIQUE,
    descricao VARCHAR(500) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- Tabela: Projetos (vinculados a uma Frente)
-- =============================================
CREATE TABLE IF NOT EXISTS flop_projetos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(10) NOT NULL UNIQUE,
    descricao VARCHAR(500) NOT NULL,
    frente_id UUID NOT NULL REFERENCES flop_frentes_estrategicas(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para busca por frente
CREATE INDEX IF NOT EXISTS flop_idx_projetos_frente ON flop_projetos(frente_id);

-- =============================================
-- Tabela: Objetivos (auto-relacionamento para hierarquia infinita)
-- =============================================
CREATE TABLE IF NOT EXISTS flop_objetivos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(10) NOT NULL UNIQUE, -- Formato OB001
    titulo VARCHAR(200) NOT NULL,
    descricao VARCHAR(500), -- Descrição opcional
    responsavel VARCHAR(255),
    data_inicio DATE, -- Data planejada de início
    data_expectativa DATE,
    projeto_id UUID NOT NULL REFERENCES flop_projetos(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES flop_objetivos(id) ON DELETE CASCADE,
    nivel INTEGER DEFAULT 1,
    ordem INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para busca hierárquica
CREATE INDEX IF NOT EXISTS flop_idx_objetivos_projeto ON flop_objetivos(projeto_id);
CREATE INDEX IF NOT EXISTS flop_idx_objetivos_parent ON flop_objetivos(parent_id);

-- =============================================
-- Tabela: Tarefas (vinculadas a um objetivo)
-- =============================================
CREATE TABLE IF NOT EXISTS flop_tarefas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(10) NOT NULL UNIQUE, -- Formato TR001
    titulo VARCHAR(100) NOT NULL, -- Título curto da tarefa
    descricao TEXT, -- Descrição detalhada (opcional)
    responsavel VARCHAR(255),
    data_inicio DATE, -- Data planejada de início
    data_expectativa DATE,
    objetivo_id UUID NOT NULL REFERENCES flop_objetivos(id) ON DELETE CASCADE,
    concluida BOOLEAN DEFAULT FALSE,
    ordem INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para busca por objetivo
CREATE INDEX IF NOT EXISTS flop_idx_tarefas_objetivo ON flop_tarefas(objetivo_id);

-- =============================================
-- Tabela: Notas (vinculadas a uma tarefa)
-- =============================================
CREATE TABLE IF NOT EXISTS flop_notas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tarefa_id UUID NOT NULL REFERENCES flop_tarefas(id) ON DELETE CASCADE,
    texto TEXT NOT NULL,
    usuario VARCHAR(255) NOT NULL,
    data_hora TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para busca por tarefa
CREATE INDEX IF NOT EXISTS flop_idx_notas_tarefa ON flop_notas(tarefa_id);

-- =============================================
-- Funções para geração de códigos sequenciais
-- =============================================

-- Função para gerar código de Frente (FE001, FE002, ...)
CREATE OR REPLACE FUNCTION flop_generate_frente_codigo()
RETURNS TRIGGER AS $$
DECLARE
    next_num INTEGER;
BEGIN
    SELECT COALESCE(MAX(CAST(SUBSTRING(codigo FROM 3) AS INTEGER)), 0) + 1
    INTO next_num
    FROM flop_frentes_estrategicas;
    
    NEW.codigo := 'FE' || LPAD(next_num::TEXT, 3, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER flop_trigger_frente_codigo
    BEFORE INSERT ON flop_frentes_estrategicas
    FOR EACH ROW
    WHEN (NEW.codigo IS NULL OR NEW.codigo = '')
    EXECUTE FUNCTION flop_generate_frente_codigo();

-- Função para gerar código de Projeto (PJ001, PJ002, ...)
CREATE OR REPLACE FUNCTION flop_generate_projeto_codigo()
RETURNS TRIGGER AS $$
DECLARE
    next_num INTEGER;
BEGIN
    SELECT COALESCE(MAX(CAST(SUBSTRING(codigo FROM 3) AS INTEGER)), 0) + 1
    INTO next_num
    FROM flop_projetos;
    
    NEW.codigo := 'PJ' || LPAD(next_num::TEXT, 3, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER flop_trigger_projeto_codigo
    BEFORE INSERT ON flop_projetos
    FOR EACH ROW
    WHEN (NEW.codigo IS NULL OR NEW.codigo = '')
    EXECUTE FUNCTION flop_generate_projeto_codigo();

-- Função para gerar código de Objetivo (OB001, OB002, ...)
CREATE OR REPLACE FUNCTION flop_generate_objetivo_codigo()
RETURNS TRIGGER AS $$
DECLARE
    next_num INTEGER;
BEGIN
    SELECT COALESCE(MAX(CAST(SUBSTRING(codigo FROM 3) AS INTEGER)), 0) + 1
    INTO next_num
    FROM flop_objetivos;
    
    NEW.codigo := 'OB' || LPAD(next_num::TEXT, 3, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER flop_trigger_objetivo_codigo
    BEFORE INSERT ON flop_objetivos
    FOR EACH ROW
    WHEN (NEW.codigo IS NULL OR NEW.codigo = '')
    EXECUTE FUNCTION flop_generate_objetivo_codigo();

-- Função para gerar código de Tarefa (TR001, TR002, ...)
CREATE OR REPLACE FUNCTION flop_generate_tarefa_codigo()
RETURNS TRIGGER AS $$
DECLARE
    next_num INTEGER;
BEGIN
    SELECT COALESCE(MAX(CAST(SUBSTRING(codigo FROM 3) AS INTEGER)), 0) + 1
    INTO next_num
    FROM flop_tarefas;
    
    NEW.codigo := 'TR' || LPAD(next_num::TEXT, 3, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER flop_trigger_tarefa_codigo
    BEFORE INSERT ON flop_tarefas
    FOR EACH ROW
    WHEN (NEW.codigo IS NULL OR NEW.codigo = '')
    EXECUTE FUNCTION flop_generate_tarefa_codigo();

-- =============================================
-- Row Level Security (RLS)
-- =============================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE flop_responsaveis ENABLE ROW LEVEL SECURITY;
ALTER TABLE flop_frentes_estrategicas ENABLE ROW LEVEL SECURITY;
ALTER TABLE flop_projetos ENABLE ROW LEVEL SECURITY;
ALTER TABLE flop_objetivos ENABLE ROW LEVEL SECURITY;
ALTER TABLE flop_tarefas ENABLE ROW LEVEL SECURITY;
ALTER TABLE flop_notas ENABLE ROW LEVEL SECURITY;

-- Políticas permissivas para usuários autenticados
CREATE POLICY flop_policy_responsaveis ON flop_responsaveis
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY flop_policy_frentes ON flop_frentes_estrategicas
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY flop_policy_projetos ON flop_projetos
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY flop_policy_objetivos ON flop_objetivos
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY flop_policy_tarefas ON flop_tarefas
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY flop_policy_notas ON flop_notas
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =============================================
-- Trigger para atualizar updated_at
-- =============================================

CREATE OR REPLACE FUNCTION flop_update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER flop_trigger_responsaveis_updated_at
    BEFORE UPDATE ON flop_responsaveis
    FOR EACH ROW EXECUTE FUNCTION flop_update_updated_at();

CREATE OR REPLACE TRIGGER flop_trigger_frentes_updated_at
    BEFORE UPDATE ON flop_frentes_estrategicas
    FOR EACH ROW EXECUTE FUNCTION flop_update_updated_at();

CREATE OR REPLACE TRIGGER flop_trigger_projetos_updated_at
    BEFORE UPDATE ON flop_projetos
    FOR EACH ROW EXECUTE FUNCTION flop_update_updated_at();

CREATE OR REPLACE TRIGGER flop_trigger_objetivos_updated_at
    BEFORE UPDATE ON flop_objetivos
    FOR EACH ROW EXECUTE FUNCTION flop_update_updated_at();

CREATE OR REPLACE TRIGGER flop_trigger_tarefas_updated_at
    BEFORE UPDATE ON flop_tarefas
    FOR EACH ROW EXECUTE FUNCTION flop_update_updated_at();
