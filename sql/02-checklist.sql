-- ═══════════════════════════════════════════════════════════════
-- EWIND: event task checklist (with countdown deadlines)
-- Idempotent: safe to run more than once.
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.event_tasks (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id     UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  owner_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  category     TEXT,                     -- e.g. Ceremony, Catering, Decoration, Documents
  assignee     TEXT,                     -- person in charge (free text: "Meg", "Me")
  notes        TEXT,
  -- Deadline: a countdown milestone (days before the event) OR a specific date.
  -- If due_offset_days != null, the date is calculated from event_date.
  -- If due_date != null, it is a fixed date. due_offset_days takes precedence when displayed.
  due_offset_days INT,                   -- e.g. 90 = "3 months before" (90 days before the event)
  due_date     DATE,                     -- alternative fixed date
  done         BOOLEAN NOT NULL DEFAULT FALSE,
  done_at      TIMESTAMPTZ,
  sort_order   INT NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tasks_event ON public.event_tasks(event_id);
CREATE INDEX IF NOT EXISTS idx_tasks_owner ON public.event_tasks(owner_id);

ALTER TABLE public.event_tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "own_tasks" ON public.event_tasks;
CREATE POLICY "own_tasks" ON public.event_tasks
  FOR ALL TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);
