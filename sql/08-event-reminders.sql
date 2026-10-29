-- ═══════════════════════════════════════════════════════════════
-- EWIND: reminders linked to an event (per-event calendar)
-- Idempotent: safe to run more than once.
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE public.agenda_reminders
  ADD COLUMN IF NOT EXISTS event_id UUID REFERENCES public.events(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_reminders_event ON public.agenda_reminders(event_id);
