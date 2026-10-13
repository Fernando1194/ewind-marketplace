-- ═══════════════════════════════════════════════════════════════
-- EWIND — Mapa de mesas
-- Idempotente: seguro rodar mais de uma vez.
-- ═══════════════════════════════════════════════════════════════

-- Mesas do evento (capacidade variável por mesa)
CREATE TABLE IF NOT EXISTS public.event_tables (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id     UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  owner_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  label        TEXT NOT NULL,            -- ex: "Mesa 1", "Família da noiva"
  capacity     INT NOT NULL DEFAULT 8,
  sort_order   INT NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tables_event ON public.event_tables(event_id);
CREATE INDEX IF NOT EXISTS idx_tables_owner ON public.event_tables(owner_id);

ALTER TABLE public.event_tables ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "own_tables" ON public.event_tables;
CREATE POLICY "own_tables" ON public.event_tables
  FOR ALL TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

-- Liga cada convidado a uma mesa (NULL = não alocado).
-- ON DELETE SET NULL: se a mesa for excluída, os convidados voltam para "não alocados".
ALTER TABLE public.event_guests
  ADD COLUMN IF NOT EXISTS table_id UUID REFERENCES public.event_tables(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_guests_table ON public.event_guests(table_id);
