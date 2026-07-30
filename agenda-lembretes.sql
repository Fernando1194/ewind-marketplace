-- ═══════════════════════════════════════════════════════════════
-- EWIND — Lembretes da Agenda (compromissos avulsos por data)
-- Idempotente: seguro rodar mais de uma vez.
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.agenda_reminders (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date         DATE NOT NULL,
  title        TEXT NOT NULL,
  notes        TEXT,
  done         BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reminders_owner ON public.agenda_reminders(owner_id);
CREATE INDEX IF NOT EXISTS idx_reminders_date  ON public.agenda_reminders(date);

ALTER TABLE public.agenda_reminders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "own_reminders" ON public.agenda_reminders;
CREATE POLICY "own_reminders" ON public.agenda_reminders
  FOR ALL TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);
