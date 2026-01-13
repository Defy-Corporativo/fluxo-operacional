-- =============================================
-- Migration: Adicionar campo titulo às tarefas
-- =============================================

-- Passo 1: Adicionar coluna titulo (permite nulo temporariamente)
ALTER TABLE flop_tarefas 
ADD COLUMN IF NOT EXISTS titulo VARCHAR(100);

-- Passo 2: Migrar dados existentes - usar primeiros 100 caracteres da descrição
UPDATE flop_tarefas 
SET titulo = LEFT(descricao, 100)
WHERE titulo IS NULL;

-- Passo 3: Tornar campo obrigatório
ALTER TABLE flop_tarefas 
ALTER COLUMN titulo SET NOT NULL;

-- Comentário para documentação
COMMENT ON COLUMN flop_tarefas.titulo IS 'Título curto da tarefa (obrigatório, exibido no header)';
COMMENT ON COLUMN flop_tarefas.descricao IS 'Descrição detalhada da tarefa (opcional, texto livre)';

-- Alterar descricao para não obrigatório (se necessário)
ALTER TABLE flop_tarefas 
ALTER COLUMN descricao DROP NOT NULL;
