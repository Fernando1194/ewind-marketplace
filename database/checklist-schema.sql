-- ═══════════════════════════════════════════════════════════════
-- EWIND — Checklist de tarefas do evento (com prazos regressivos)
-- Idempotente: seguro rodar mais de uma vez.
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.event_tasks (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id     UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  owner_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  category     TEXT,                     -- ex: Cerimônia, Buffet, Decoração, Documentos
  assignee     TEXT,                     -- responsável (texto livre: "Meg", "Eu")
  notes        TEXT,
  -- Prazo: marco regressivo (dias antes do evento) OU data específica.
  -- Se due_offset_days != null, a data é calculada a partir do event_date.
  -- Se due_date != null, é uma data fixa. due_offset_days tem prioridade na exibição.
  due_offset_days INT,                   -- ex: 90 = "3 meses antes" (90 dias antes do evento)
  due_date     DATE,                     -- data fixa alternativa
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
