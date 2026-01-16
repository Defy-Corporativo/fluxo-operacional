-- Migration to add 'titulo' to flop_objetivos
-- Date: 2026-01-15

-- 1. Add column 'titulo'
ALTER TABLE flop_objetivos 
ADD COLUMN IF NOT EXISTS titulo VARCHAR(200);

-- 2. Populate 'titulo' with existing 'descricao' (truncated to fit if necessary, though limit is 200 vs 500)
-- Since 'descricao' is 500 and 'titulo' is 200, we'll substring it.
UPDATE flop_objetivos 
SET titulo = SUBSTRING(descricao, 1, 200)
WHERE titulo IS NULL;

-- 3. Make 'titulo' NOT NULL after population
ALTER TABLE flop_objetivos 
ALTER COLUMN titulo SET NOT NULL;

-- 4. Update comment/description about the change
COMMENT ON COLUMN flop_objetivos.titulo IS 'Título do objetivo';
