-- ═══════════════════════════════════════════════════════════════
-- EWIND: quote comparison (a bridge to the marketplace)
-- Idempotent: safe to run more than once.
-- ═══════════════════════════════════════════════════════════════

-- A comparison = a set of quotes for one category
-- (e.g. "Venues", "Catering", "Photographers")
CREATE TABLE IF NOT EXISTS public.event_comparisons (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id     UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  owner_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,            -- e.g. "Venues", "Catering"
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- One option/quote within a comparison
CREATE TABLE IF NOT EXISTS public.comparison_options (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  comparison_id UUID NOT NULL REFERENCES public.event_comparisons(id) ON DELETE CASCADE,
  owner_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,           -- venue/supplier name
  price         NUMERIC(12,2),           -- quoted price
  capacity      INT,                     -- capacity (optional, for venues)
  contact       TEXT,                    -- phone/email/contact
  notes         TEXT,
  -- included items: JSON object { "DJ": true, "Decoration": false, ... }
  included      JSONB NOT NULL DEFAULT '{}'::jsonb,
  chosen        BOOLEAN NOT NULL DEFAULT FALSE,  -- marked as the chosen one
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
