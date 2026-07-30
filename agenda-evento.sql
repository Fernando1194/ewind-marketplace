-- ═══════════════════════════════════════════════════════════════
-- EWIND — Lembretes vinculados a evento (agenda por evento)
-- Idempotente: seguro rodar mais de uma vez.
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE public.agenda_reminders
  ADD COLUMN IF NOT EXISTS event_id UUID REFERENCES public.events(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_reminders_event ON public.agenda_reminders(event_id);
