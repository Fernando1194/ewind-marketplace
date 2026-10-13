-- ═══════════════════════════════════════════════════════════════
-- EWIND — Gestor de Eventos (Fase 1) — versão idempotente
-- Seguro para rodar múltiplas vezes (faz DROP antes de cada CREATE policy).
-- ═══════════════════════════════════════════════════════════════

-- 1. EVENTOS ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.events (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  type         TEXT NOT NULL DEFAULT 'Casamento',
  event_date   DATE,
  guests_estimate INT,
  budget_total NUMERIC(12,2),
  notes        TEXT,
  status       TEXT NOT NULL DEFAULT 'planning' CHECK (status IN ('planning','confirmed','done','cancelled')),
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now()
);

-- 2. CONTRATOS / FORNECEDORES ────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.event_contracts (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id        UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  owner_id        UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  supplier_name   TEXT NOT NULL,
  category        TEXT,
  contact_name    TEXT,
  contact_phone   TEXT,
  contact_email   TEXT,
  total_value     NUMERIC(12,2) NOT NULL DEFAULT 0,
  signed_date     DATE,
  service_date    DATE,
  cancellation_policy TEXT,
  penalty_clause      TEXT,
  special_clauses     TEXT,
  contract_file_url   TEXT,
  notes           TEXT,
  status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft','active','completed','cancelled')),
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- 3. PARCELAS DE PAGAMENTO ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.contract_payments (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_id  UUID NOT NULL REFERENCES public.event_contracts(id) ON DELETE CASCADE,
  owner_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  label        TEXT,
  amount       NUMERIC(12,2) NOT NULL,
  due_date     DATE NOT NULL,
  paid         BOOLEAN NOT NULL DEFAULT FALSE,
  paid_date    DATE,
  payment_method TEXT,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- ── Índices ─────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_events_owner       ON public.events(owner_id);
CREATE INDEX IF NOT EXISTS idx_contracts_event    ON public.event_contracts(event_id);
CREATE INDEX IF NOT EXISTS idx_contracts_owner    ON public.event_contracts(owner_id);
CREATE INDEX IF NOT EXISTS idx_payments_contract  ON public.contract_payments(contract_id);
CREATE INDEX IF NOT EXISTS idx_payments_due       ON public.contract_payments(owner_id, due_date) WHERE paid = FALSE;

-- ── Row Level Security ──────────────────────────────────────────
ALTER TABLE public.events            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_contracts   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "own_events"    ON public.events;
DROP POLICY IF EXISTS "own_contracts" ON public.event_contracts;
DROP POLICY IF EXISTS "own_payments"  ON public.contract_payments;

CREATE POLICY "own_events"    ON public.events            FOR ALL TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "own_contracts" ON public.event_contracts   FOR ALL TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "own_payments"  ON public.contract_payments FOR ALL TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

-- ── Storage bucket para PDFs (privado) ──────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('event-contracts', 'event-contracts', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "own_contract_files_select" ON storage.objects;
DROP POLICY IF EXISTS "own_contract_files_insert" ON storage.objects;
DROP POLICY IF EXISTS "own_contract_files_delete" ON storage.objects;

CREATE POLICY "own_contract_files_select" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'event-contracts' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "own_contract_files_insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'event-contracts' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "own_contract_files_delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'event-contracts' AND (storage.foldername(name))[1] = auth.uid()::text);
