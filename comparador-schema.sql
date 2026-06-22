-- ═══════════════════════════════════════════════════════════════
-- EWIND — Comparador de orçamentos (ponte para o marketplace)
-- Idempotente: seguro rodar mais de uma vez.
-- ═══════════════════════════════════════════════════════════════

-- Uma comparação = um conjunto de cotações de uma categoria
-- (ex: "Espaços", "Buffets", "Fotógrafos")
CREATE TABLE IF NOT EXISTS public.event_comparisons (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id     UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  owner_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,            -- ex: "Espaços", "Buffet"
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- Uma opção/cotação dentro de uma comparação
CREATE TABLE IF NOT EXISTS public.comparison_options (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  comparison_id UUID NOT NULL REFERENCES public.event_comparisons(id) ON DELETE CASCADE,
  owner_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,           -- nome do espaço/fornecedor
  price         NUMERIC(12,2),           -- valor do orçamento
  capacity      INT,                     -- capacidade (opcional, p/ espaços)
  contact       TEXT,                    -- telefone/email/contato
  notes         TEXT,
  -- itens inclusos: objeto JSON { "DJ": true, "Decoração": false, ... }
  included      JSONB NOT NULL DEFAULT '{}'::jsonb,
  chosen        BOOLEAN NOT NULL DEFAULT FALSE,  -- marcada como escolhida
  sort_order    INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_comparisons_event ON public.event_comparisons(event_id);
CREATE INDEX IF NOT EXISTS idx_comparisons_owner ON public.event_comparisons(owner_id);
CREATE INDEX IF NOT EXISTS idx_options_comparison ON public.comparison_options(comparison_id);
CREATE INDEX IF NOT EXISTS idx_options_owner ON public.comparison_options(owner_id);

ALTER TABLE public.event_comparisons   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comparison_options  ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "own_comparisons" ON public.event_comparisons;
DROP POLICY IF EXISTS "own_options"     ON public.comparison_options;

CREATE POLICY "own_comparisons" ON public.event_comparisons
  FOR ALL TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "own_options" ON public.comparison_options
  FOR ALL TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
