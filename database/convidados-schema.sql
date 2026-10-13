-- ═══════════════════════════════════════════════════════════════
-- EWIND — Gestão de Convidados (aba dentro do evento)
-- Idempotente: seguro rodar mais de uma vez.
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.event_guests (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id    UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  owner_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('confirmed','declined','pending')),
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_guests_event ON public.event_guests(event_id);
CREATE INDEX IF NOT EXISTS idx_guests_owner ON public.event_guests(owner_id);

ALTER TABLE public.event_guests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "own_guests" ON public.event_guests;
CREATE POLICY "own_guests" ON public.event_guests
  FOR ALL TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- Campo opcional no evento: valor por convidado (informativo, NÃO entra no total financeiro)
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS cost_per_guest NUMERIC(10,2);
